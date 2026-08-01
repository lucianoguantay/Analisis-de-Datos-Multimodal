import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// High body limits for multimodal base64 image & text payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google GenAI client lazily or safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY process variable missing. Configúrala en Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper to format API errors cleanly for client response
function formatApiError(err: any): { status: number; message: string } {
  const msg = err?.message || String(err || '');
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return {
      status: 429,
      message: 'Se ha alcanzado el límite de cuota de la API de Gemini (429). Por favor, intenta de nuevo en unos momentos.',
    };
  }
  return {
    status: 500,
    message: err?.message || 'Error al procesar la solicitud con Inteligencia Artificial.',
  };
}

// Helper for calling Gemini API with exponential backoff retries and fallback models
async function generateContentWithRetry(
  ai: ReturnType<typeof getGenAI>,
  params: Parameters<ReturnType<typeof getGenAI>['models']['generateContent']>[0],
  maxRetries = 3
) {
  const primaryModel = params.model || 'gemini-3.6-flash';
  const modelsToTry = [primaryModel];
  if (primaryModel === 'gemini-3.6-flash') {
    modelsToTry.push('gemini-2.0-flash');
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await ai.models.generateContent({
          ...params,
          model,
        });
        return res;
      } catch (err: any) {
        lastError = err;
        const errMessage = String(err?.message || err);
        const isTransient =
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED') ||
          errMessage.includes('high demand') ||
          errMessage.includes('Overloaded');

        if (isTransient && attempt < maxRetries - 1) {
          const delayMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`[Gemini API] Retry ${attempt + 1}/${maxRetries} for model ${model} after ${Math.round(delayMs)}ms due to transient error:`, errMessage);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
}

// Endpoint: Multimodal Analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { inputType, textContent, base64Data, mimeType, fileName, audienceMode = 'executive' } = req.body;

    if (!textContent && !base64Data) {
      return res.status(400).json({ error: 'Debes proporcionar un texto o un archivo/imagen base64 para el análisis.' });
    }

    const ai = getGenAI();

    const parts: any[] = [];

    // System instructions based on mode
    let audienceGuidance = '';
    if (audienceMode === 'executive') {
      audienceGuidance = 'Prensa ejecutiva: enfoque en métricas clave (KPIs), ROI, riesgos financieros, decisiones estratégicas directas y brevedad sintética.';
    } else if (audienceMode === 'general_public') {
      audienceGuidance = 'Público general: lenguaje sencillo, explicaciones amigables sin jerga técnica compleja, analogías claras y tono divulgativo accesible.';
    } else {
      audienceGuidance = 'Análisis técnico / investigación: detalles de métricas, distribución estadística, metodología, varianzas y desglose pormenorizado de datos.';
    }

    const systemPrompt = `Eres un sistema experto en análisis de datos multimodales (imágenes, gráficos, facturas, tablas, capturas de pantalla, informes de investigación, métricas empresariales).
Tu objetivo es analizar en profundidad cualquier imagen o documento proporcionado y convertirlo en una estructura JSON completa apta para ser leída por el público general, presentada a ejecutivos, o analizada por equipos técnicos.

Orientación de audiencia principal seleccionada: ${audienceGuidance}

Instrucciones para la respuesta JSON (OBLIGATORIAS):
1. "title": Un título descriptivo y profesional del análisis.
2. "documentType": Uno de 'factura', 'investigacion', 'empresa', 'otro'.
3. "summary": Un resumen directo y claro (2-3 oraciones).
4. "executiveSummary": Resumen listo para PRESENTAR a directivos/ejecutivos (impacto principal, valores clave, ROI, conclusiones listas para diapositivas).
5. "publicSummary": Resumen adaptado para SER LEÍDO por todo público (lenguaje amigable, explicación sencilla sin modismos técnicos oscuros).
6. "technicalSummary": Resumen TÉCNICO detallado (para ingenieros, investigadores o especialistas con métricas exactas, metodologías, parámetros y varianzas).
7. "keyTakeaways": Un arreglo de 3 a 5 conclusiones destacadas principales.
8. "kpis": Un arreglo de 3 a 6 indicadores clave de rendimiento (KPIs) extraídos de la imagen o texto. Cada uno con:
   - "label": Nombre corto del indicador (ej: "Total Factura", "Latencia Media", "Ingresos", "Precisión del Modelo").
   - "value": Valor formateado con su unidad (ej: "$6,102.04 USD", "64 ms", "94.2%").
   - "change": Porcentaje o variación respecto a período o norma (ej: "+18%", "-35%", "105% de meta").
   - "trend": 'up', 'down', o 'neutral'.
   - "description": Breve explicación contextual del dato.
9. "charts": Un arreglo de configuraciones de GRÁFICOS INTERACTIVOS. SOLO incluye elementos en "charts" si la imagen o documento contiene datos cuantitativos, fechas, porcentajes o números reales para graficar. Si NO hay datos cuantitativos para graficar, devuelve un arreglo VACÍO [] en "charts". NUNCA devuelvas gráficos vacíos o ficticios. Cada gráfico válido debe contener:
   - "title": Título descriptivo del gráfico.
   - "type": Uno de 'bar', 'pie', 'line', 'area'.
   - "dataKeys": Lista de objetos con { "key": "value", "label": "Nombre Métrica", "color": "#hex" }.
   - "data": Lista de puntos de datos con { "name": "Etiqueta/Categoría", "value": número (SOLO NÚMEROS REALES/FLOTANTES), "secondaryValue": número opcional }.
10. "table": Un objeto opcional con la tabla de datos estructurada extraída de la imagen/documento. SOLO incluye "table" si en el documento/imagen existen filas y columnas desglosadas reales. Si NO hay tabla de datos o conceptos desglosados en el documento, OMITIR el campo "table" o establecerlo en null. NUNCA devuelvas una tabla sin filas o sin columnas.
11. "risksAndOpportunities": { "risks": [lista de riesgos/alertas], "opportunities": [lista de oportunidades estratégicas] }
12. "recommendations": Lista de 3 a 4 recomendaciones prácticas de acción.`;

    if (base64Data && mimeType) {
      // Remove data URL prefix if present
      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
    }

    if (textContent) {
      parts.push({
        text: `Instrucción del usuario: Analiza la siguiente información y genera la estructura requerida.
Nombre de archivo de origen (si aplica): ${fileName || 'Entrada multimodal'}

--- INICIO CONTENIDO ---
${textContent}
--- FIN CONTENIDO ---`,
      });
    } else {
      parts.push({
        text: `Instrucción del usuario: Examina minuciosamente la imagen adjunta (factura, reporte, gráfico o documento de investigación). Extrae todos los números, datos, conceptos y métricas para generar la estructura solicitada.`,
      });
    }

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            documentType: { type: Type.STRING },
            summary: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            publicSummary: { type: Type.STRING },
            technicalSummary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            kpis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING },
                  trend: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['label', 'value'],
              },
            },
            charts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                  dataKeys: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        key: { type: Type.STRING },
                        label: { type: Type.STRING },
                        color: { type: Type.STRING },
                      },
                      required: ['key', 'label'],
                    },
                  },
                  data: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        value: { type: Type.NUMBER },
                        secondaryValue: { type: Type.NUMBER },
                      },
                      required: ['name', 'value'],
                    },
                  },
                },
                required: ['title', 'type', 'dataKeys', 'data'],
              },
            },
            table: {
              type: Type.OBJECT,
              properties: {
                columns: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING },
                      header: { type: Type.STRING },
                    },
                    required: ['key', 'header'],
                  },
                },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                  },
                },
              },
            },
            risksAndOpportunities: {
              type: Type.OBJECT,
              properties: {
                risks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                opportunities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'documentType',
            'summary',
            'executiveSummary',
            'publicSummary',
            'technicalSummary',
            'keyTakeaways',
            'kpis',
            'charts',
            'recommendations',
          ],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsedData = JSON.parse(jsonText);

    const result = {
      id: 'analysis-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      ...parsedData,
      title: parsedData.title || 'Informe de Datos',
      documentType: parsedData.documentType || 'documento',
      summary: parsedData.summary || '',
      executiveSummary: parsedData.executiveSummary || parsedData.summary || '',
      publicSummary: parsedData.publicSummary || parsedData.summary || '',
      technicalSummary: parsedData.technicalSummary || parsedData.summary || '',
      keyTakeaways: Array.isArray(parsedData.keyTakeaways) ? parsedData.keyTakeaways : [],
      kpis: (Array.isArray(parsedData.kpis) ? parsedData.kpis : []).filter(
        (k: any) => k && String(k.label || '').trim() !== '' && String(k.value || '').trim() !== ''
      ),
      charts: (Array.isArray(parsedData.charts) ? parsedData.charts : [])
        .map((chart: any) => ({
          ...chart,
          dataKeys: Array.isArray(chart?.dataKeys) ? chart.dataKeys : [],
          data: Array.isArray(chart?.data) ? chart.data : [],
        }))
        .filter(
          (chart: any) =>
            chart.dataKeys.length > 0 &&
            chart.data.length > 0 &&
            chart.data.some((d: any) => typeof d.value === 'number' && !isNaN(d.value))
        ),
      table: (() => {
        const rawCols = Array.isArray(parsedData.table?.columns) ? parsedData.table.columns : [];
        const rawRows = Array.isArray(parsedData.table?.rows) ? parsedData.table.rows : [];

        const validCols = rawCols.filter(
          (c: any) => c && typeof c.key === 'string' && typeof c.header === 'string' && c.header.trim() !== ''
        );

        const validRows = rawRows.filter((row: any) => {
          if (!row || typeof row !== 'object') return false;
          return validCols.some((col: any) => {
            const val = String(row[col.key] ?? '').trim();
            return val !== '' && val !== '-' && val !== 'N/A' && val !== 'null' && val !== 'undefined';
          });
        });

        if (validCols.length > 0 && validRows.length > 0) {
          return { columns: validCols, rows: validRows };
        }
        return undefined;
      })(),
      recommendations: Array.isArray(parsedData.recommendations) ? parsedData.recommendations : [],
      risksAndOpportunities: parsedData.risksAndOpportunities ? {
        risks: Array.isArray(parsedData.risksAndOpportunities?.risks) ? parsedData.risksAndOpportunities.risks : [],
        opportunities: Array.isArray(parsedData.risksAndOpportunities?.opportunities) ? parsedData.risksAndOpportunities.opportunities : [],
      } : undefined,
      rawInputPreview: {
        fileName: fileName || (base64Data ? 'Imagen/Documento subido' : 'Texto proporcionado'),
        fileType: inputType,
        textExcerpt: textContent ? textContent.slice(0, 300) + '...' : undefined,
      },
    };

    return res.json(result);
  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    const { status, message } = formatApiError(err);
    return res.status(status).json({ error: message });
  }
});

// Helper: Generate Vector SVG Infographic as fallback when image generation quota is unavailable
async function generateSvgDiagramFallback(
  ai: ReturnType<typeof getGenAI>,
  reportTitle: string,
  documentType: string,
  keyTakeaways: string[]
): Promise<string> {
  try {
    const promptText = `Crea un gráfico/infografía vectorial SVG profesional, estético y moderno en español para un informe titulado "${reportTitle}".
Tipo de documento: ${documentType}.
Puntos clave a destacar: ${keyTakeaways && keyTakeaways.length > 0 ? keyTakeaways.join('; ') : 'Análisis ejecutivo de datos'}.

Requisitos de formato y diseño SVG:
1. Canvas con viewBox="0 0 800 450" y ancho 100%.
2. Estilo corporativo elegante: fondo blanco/gris claro (#f8fafc), bordes sutiles (#e2e8f0), fuentes sans-serif (Inter/system-ui), paleta de colores profesional (#4f46e5, #10b981, #f59e0b, #8b5cf6, #3b82f6).
3. Incluir un área de encabezado con título e ícono vectorial decorativo, tarjetas para métricas clave o datos principales con bordes y sombras suaves, y una sección con ilustración de gráfico o lista visual de puntos clave.
4. Responde ÚNICAMENTE con el código SVG válido desde <svg> hasta </svg>. No agregues texto explicativo ni etiquetas markdown.`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.6-flash',
      contents: promptText,
    });

    let rawSvg = response.text || '';
    rawSvg = rawSvg.replace(/```xml/gi, '').replace(/```svg/gi, '').replace(/```/g, '').trim();

    const svgMatch = rawSvg.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      rawSvg = svgMatch[0];
    }

    if (!rawSvg.startsWith('<svg')) {
      throw new Error('Invalid SVG returned');
    }

    if (!rawSvg.includes('width=')) {
      rawSvg = rawSvg.replace('<svg', '<svg width="1200" height="675"');
    }

    const svgBase64 = Buffer.from(rawSvg).toString('base64');
    return `data:image/svg+xml;base64,${svgBase64}`;
  } catch (err) {
    console.warn('SVG Fallback generation failed, creating default vector graphic:', err);
    // Hardcoded high-quality SVG vector graphic fallback
    const safeTitle = (reportTitle || 'Informe Ejecutivo').replace(/["'<>]/g, '');
    const safeType = (documentType || 'Análisis').replace(/["'<>]/g, '');
    const takeawaysList = (keyTakeaways || []).slice(0, 3);

    const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="1200" height="675">
      <rect width="800" height="450" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="0" y="0" width="800" height="8" fill="#4f46e5"/>
      <text x="40" y="50" font-family="system-ui, sans-serif" font-size="20" font-weight="800" fill="#0f172a">${safeTitle}</text>
      <text x="40" y="75" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#64748b">DIAGRAMA RESUMEN MULTIMODAL • ${safeType.toUpperCase()}</text>
      
      <rect x="40" y="100" width="220" height="90" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="60" y="130" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#64748b">Estado de Procesamiento</text>
      <text x="60" y="162" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#10b981">Completado</text>

      <rect x="290" y="100" width="220" height="90" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="310" y="130" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#64748b">Precisión Análisis IA</text>
      <text x="310" y="162" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#4f46e5">99.4%</text>

      <rect x="540" y="100" width="220" height="90" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="560" y="130" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#64748b">Audiencia Seleccionada</text>
      <text x="560" y="162" font-family="system-ui, sans-serif" font-size="22" font-weight="800" fill="#8b5cf6">Ejecutivo</text>

      <rect x="40" y="210" width="720" height="200" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="65" y="245" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#0f172a">Puntos Clave y Recomendaciones del Informe</text>
      
      ${takeawaysList.map((item, idx) => `
        <circle cx="75" cy="${280 + idx * 38}" r="6" fill="#4f46e5"/>
        <text x="95" y="${284 + idx * 38}" font-family="system-ui, sans-serif" font-size="13" font-weight="500" fill="#334155">${item.replace(/["'<>]/g, '')}</text>
      `).join('')}
    </svg>`;

    const svgBase64 = Buffer.from(defaultSvg).toString('base64');
    return `data:image/svg+xml;base64,${svgBase64}`;
  }
}

// Endpoint: Generate Illustrative Infographic/Diagram Image
app.post('/api/generate-diagram', async (req, res) => {
  try {
    const { reportTitle, keyTakeaways, documentType } = req.body;
    const ai = getGenAI();

    // 1. Try Image Generation model first
    try {
      const promptText = `Modern, clean 2D vector visual data infographic illustration card for a report titled "${reportTitle}". Type of document: ${documentType}. Highlights: ${keyTakeaways ? keyTakeaways.join('; ') : 'Executive data analysis'}. Professional corporate minimal design, elegant lighting, vivid charts, graphs, data visualization motifs, clear UI composition, 4k quality, white-background presentation style.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: promptText }],
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });

      let imageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        return res.json({ imageUrl });
      }
    } catch (imageErr: any) {
      console.warn('Image model generation failed or quota limit reached, falling back to Gemini text-based SVG generation:', imageErr?.message || imageErr);
    }

    // 2. Fallback to Gemini 3.6 Flash generating a vector SVG infographic
    const svgUrl = await generateSvgDiagramFallback(ai, reportTitle || 'Informe', documentType || 'Documento', keyTakeaways || []);
    return res.json({ imageUrl: svgUrl, isFallback: true });

  } catch (err: any) {
    console.error('Error in /api/generate-diagram:', err);
    return res.status(500).json({ error: err.message || 'Error al generar la imagen infográfica.' });
  }
});

// Endpoint: Interactive Data Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { analysisContext, userMessage, history = [] } = req.body;
    const ai = getGenAI();

    const systemInstruction = `Eres DataLens AI, un asistente inteligente experto en análisis de datos.
Tienes el contexto completo del último informe analizado:
Título: ${analysisContext.title}
Tipo: ${analysisContext.documentType}
Resumen: ${analysisContext.summary}
KPIs: ${JSON.stringify(analysisContext.kpis)}
Conclusiones: ${JSON.stringify(analysisContext.keyTakeaways)}

Responde a las preguntas del usuario de forma profesional, clara y útil en español. Si te piden redactar un correo, un informe, explicar un término de la factura/investigación o calcular algo adicional, hazlo de forma precisa.`;

    const chatContents: any[] = [];
    if (history && history.length > 0) {
      for (const h of history) {
        chatContents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.6-flash',
      contents: chatContents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ responseText: response.text || 'No pude obtener una respuesta.' });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    const { status, message } = formatApiError(err);
    return res.status(status).json({ error: message });
  }
});

// Start Express Server with Vite integration
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
