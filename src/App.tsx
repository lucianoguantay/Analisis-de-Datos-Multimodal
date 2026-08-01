import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { ExecutiveReportView } from './components/ExecutiveReportView';
import { ChartsView } from './components/ChartsView';
import { DataTable } from './components/DataTable';
import { DiagramGenerator } from './components/DiagramGenerator';
import { DataChat } from './components/DataChat';
import { CameraModal } from './components/CameraModal';
import { AnalysisResult, AudienceMode } from './types';
import { Sparkles, Printer, Copy, Check, FileCheck2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function App() {
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('executive');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const handleAnalyze = async (payload: {
    inputType: 'text' | 'image' | 'file';
    textContent?: string;
    base64Data?: string;
    mimeType?: string;
    fileName?: string;
    audienceMode: AudienceMode;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error inesperado al procesar la solicitud.');
      }

      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Analysis submission error:', err);
      let msg = err.message || 'Error al conectar con el servidor de análisis.';
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
        msg = 'El servicio de IA está experimentando alta demanda momentánea. Por favor, intenta de nuevo en unos segundos.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraCapture = (base64Data: string) => {
    handleAnalyze({
      inputType: 'image',
      base64Data,
      mimeType: 'image/jpeg',
      fileName: 'Foto Capturada (Cámara)',
      audienceMode,
    });
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const textToCopy = `=== ${analysisResult.title} ===
[${(analysisResult.documentType || 'DOCUMENTO').toUpperCase()}] - ${analysisResult.timestamp}

RESUMEN:
${analysisResult.summary}

RESUMEN EJECUTIVO:
${analysisResult.executiveSummary}

PUNTOS CLAVE:
${(analysisResult.keyTakeaways || []).map((t, i) => `${i + 1}. ${t}`).join('\n')}

INDICADORES CLAVE (KPIs):
${(analysisResult.kpis || []).map((k) => `- ${k.label}: ${k.value} (${k.change || 'N/A'})`).join('\n')}

RECOMENDACIONES:
${(analysisResult.recommendations || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handlePrint = () => {
    const pdfBtn = document.getElementById('download-pdf-btn');
    if (pdfBtn) {
      pdfBtn.click();
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <Navbar
        audienceMode={audienceMode}
        onAudienceModeChange={setAudienceMode}
        onReset={() => setAnalysisResult(null)}
        hasAnalysis={!!analysisResult}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!analysisResult ? (
          /* Landing / Upload Section */
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Banner */}
            <div className="text-center space-y-3 pt-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Analizador Multimodal • Gemini AI Studio</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Transforma facturas, informes y datos en un{' '}
                <span className="text-indigo-600">Análisis Claro y Ejecutivo</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
                Diseñado para estudiantes de informática, docentes y líderes ejecutivos.
                Carga fotos de facturas, investigaciones académicas o reportes en texto para generar paneles con gráficos interactivos e indicadores estadísticos.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Main Upload Box */}
            <UploadZone
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              audienceMode={audienceMode}
              onAudienceModeChange={setAudienceMode}
              onOpenCamera={() => setIsCameraOpen(true)}
            />
          </div>
        ) : (
          /* Analysis Dashboard View */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Toolbar */}
            <div className="no-print flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <button
                onClick={() => setAnalysisResult(null)}
                className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a cargar otro archivo</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto Informe</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Exportar Reporte / PDF</span>
                </button>
              </div>
            </div>

            {/* Complete Report Container to Export in PDF */}
            <div id="full-report-container" className="space-y-8 bg-slate-50 p-1 sm:p-2 rounded-2xl">
              {/* Executive Report Component */}
              <ExecutiveReportView
                analysis={analysisResult}
                audienceMode={audienceMode}
                onAudienceModeChange={setAudienceMode}
              />

              {/* Charts View Component */}
              <ChartsView charts={analysisResult.charts} />

              {/* Data Table Extraction */}
              <DataTable table={analysisResult.table} />

              {/* AI Infographic Diagram Banner Generator */}
              <DiagramGenerator
                reportTitle={analysisResult.title}
                documentType={analysisResult.documentType}
                keyTakeaways={analysisResult.keyTakeaways}
                initialImageUrl={analysisResult.generatedDiagramUrl}
                onDiagramGenerated={(url) =>
                  setAnalysisResult((prev) => (prev ? { ...prev, generatedDiagramUrl: url } : prev))
                }
              />
            </div>

            {/* Interactive Data Chat */}
            <div className="no-print">
              <DataChat analysis={analysisResult} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            DataLens AI • Theme Geometric Balance • Powered by Google AI Studio
          </p>
          <p className="text-slate-500 font-mono text-[11px]">
            Ingeniería en Informática • Gemini 3.6 Flash
          </p>
        </div>
      </footer>

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
