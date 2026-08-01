import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResult, AudienceMode } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Download,
  Printer,
  FileDown,
  Copy,
  Check
} from 'lucide-react';

interface ExecutiveReportViewProps {
  analysis: AnalysisResult;
  audienceMode: AudienceMode;
  onAudienceModeChange: (mode: AudienceMode) => void;
}

function oklchToRgb(oklchStr: string): string {
  const regex = /oklch\(\s*([\d.%]+)\s+([\d.%]+)\s+([\d.%deg]+)(?:\s*\/\s*([\d.%]+))?\s*\)/gi;
  return oklchStr.replace(regex, (_, lRaw, cRaw, hRaw, aRaw) => {
    try {
      let l = parseFloat(lRaw);
      if (lRaw && lRaw.endsWith('%')) l /= 100;

      let c = parseFloat(cRaw);
      if (cRaw && cRaw.endsWith('%')) c /= 100;

      let h = parseFloat(hRaw);

      let a = aRaw !== undefined ? parseFloat(aRaw) : 1;
      if (aRaw && aRaw.endsWith('%')) a /= 100;

      if (isNaN(l)) l = 0.5;
      if (isNaN(c)) c = 0;
      if (isNaN(h)) h = 0;
      if (isNaN(a)) a = 1;

      const hRad = (h * Math.PI) / 180;
      const aLab = c * Math.cos(hRad);
      const bLab = c * Math.sin(hRad);

      const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
      const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
      const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

      const lR = l_ * l_ * l_;
      const mR = m_ * m_ * m_;
      const sR = s_ * s_ * s_;

      let r = +4.0767416621 * lR - 3.3077115913 * mR + 0.2309699292 * sR;
      let g = -1.2684380046 * lR + 2.6097574011 * mR - 0.3413193965 * sR;
      let b = -0.0041960863 * lR - 0.7034186147 * mR + 1.7076147010 * sR;

      const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
      r = Math.min(255, Math.max(0, Math.round(gamma(r) * 255)));
      g = Math.min(255, Math.max(0, Math.round(gamma(g) * 255)));
      b = Math.min(255, Math.max(0, Math.round(gamma(b) * 255)));

      if (a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return 'rgb(100, 100, 100)';
    }
  });
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({
  analysis,
  audienceMode,
  onAudienceModeChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case 'factura':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Factura Comercial</span>
          </span>
        );
      case 'investigacion':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Investigación Académica</span>
          </span>
        );
      case 'empresa':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Métricas Empresariales</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Análisis Multimodal</span>
          </span>
        );
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-rose-600" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  // Get active text based on selected audience mode
  const currentSummaryText =
    audienceMode === 'executive'
      ? analysis.executiveSummary
      : audienceMode === 'general_public'
      ? analysis.publicSummary
      : analysis.technicalSummary;

  const generateJsPDFTextFallback = () => {
    const doc = new jsPDF();
    let y = 15;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(analysis.title || 'Resumen Ejecutivo', maxLineWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 8 + 4;

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Tipo de Documento: ${(analysis.documentType || 'Análisis').toUpperCase()} | Fecha: ${analysis.timestamp || new Date().toLocaleDateString()}`, margin, y);
    y += 8;

    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Summary Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`RESUMEN DETALLADO (${audienceMode.toUpperCase()})`, margin, y);
    y += 7;

    // Summary Text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const summaryText = currentSummaryText || analysis.summary || '';
    const summaryLines = doc.splitTextToSize(summaryText, maxLineWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 8;

    // KPIs
    if (analysis.kpis && analysis.kpis.length > 0) {
      if (y > 240) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('INDICADORES CLAVE (KPIs)', margin, y);
      y += 7;

      doc.setFontSize(10);
      analysis.kpis.forEach((kpi) => {
        if (y > 270) { doc.addPage(); y = 15; }
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${kpi.label}: `, margin + 2, y);
        const labelWidth = doc.getTextWidth(`• ${kpi.label}: `);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(79, 70, 229);
        doc.text(`${kpi.value}${kpi.change ? ` (${kpi.change})` : ''}`, margin + 2 + labelWidth, y);
        y += 6;
      });
      y += 4;
    }

    // Key Takeaways
    if (analysis.keyTakeaways && analysis.keyTakeaways.length > 0) {
      if (y > 240) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('PUNTOS CLAVE Y CONCLUSIONES', margin, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      analysis.keyTakeaways.forEach((point, idx) => {
        const lines = doc.splitTextToSize(`${idx + 1}. ${point}`, maxLineWidth - 4);
        if (y + lines.length * 5 > 280) { doc.addPage(); y = 15; }
        doc.text(lines, margin + 2, y);
        y += lines.length * 5 + 2;
      });
      y += 4;
    }

    // Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      if (y > 240) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('RECOMENDACIONES DE ACCIÓN', margin, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      analysis.recommendations.forEach((rec, idx) => {
        const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, maxLineWidth - 4);
        if (y + lines.length * 5 > 280) { doc.addPage(); y = 15; }
        doc.text(lines, margin + 2, y);
        y += lines.length * 5 + 2;
      });
      y += 4;
    }

    // Risks & Opportunities
    if (analysis.risksAndOpportunities) {
      const { risks, opportunities } = analysis.risksAndOpportunities;
      if ((risks && risks.length > 0) || (opportunities && opportunities.length > 0)) {
        if (y > 240) { doc.addPage(); y = 15; }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text('ANÁLISIS DE RIESGOS Y OPORTUNIDADES', margin, y);
        y += 7;

        if (risks && risks.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(225, 29, 72);
          doc.text('Riesgos Detectados:', margin + 2, y);
          y += 6;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          risks.forEach((risk) => {
            const lines = doc.splitTextToSize(`• ${risk}`, maxLineWidth - 6);
            if (y + lines.length * 5 > 280) { doc.addPage(); y = 15; }
            doc.text(lines, margin + 4, y);
            y += lines.length * 5 + 2;
          });
          y += 2;
        }

        if (opportunities && opportunities.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129);
          doc.text('Oportunidades Estratégicas:', margin + 2, y);
          y += 6;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          opportunities.forEach((opp) => {
            const lines = doc.splitTextToSize(`• ${opp}`, maxLineWidth - 6);
            if (y + lines.length * 5 > 280) { doc.addPage(); y = 15; }
            doc.text(lines, margin + 4, y);
            y += lines.length * 5 + 2;
          });
        }
        y += 4;
      }
    }

    // Data Table if present
    if (analysis.table && analysis.table.columns && analysis.table.rows && analysis.table.rows.length > 0) {
      if (y > 220) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('TABLA DE DATOS EXTRAÍDOS', margin, y);
      y += 7;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      const headers = analysis.table.columns.map((c) => c.header).join(' | ');
      const headerLines = doc.splitTextToSize(headers, maxLineWidth);
      doc.text(headerLines, margin + 2, y);
      y += headerLines.length * 5 + 2;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      analysis.table.rows.forEach((row) => {
        const rowText = analysis.table!.columns.map((c) => String(row[c.key] ?? '')).join(' | ');
        const rowLines = doc.splitTextToSize(rowText, maxLineWidth);
        if (y + rowLines.length * 4.5 > 280) { doc.addPage(); y = 15; }
        doc.text(rowLines, margin + 2, y);
        y += rowLines.length * 4.5 + 2;
      });
    }

    const cleanTitle = (analysis.title || 'Resumen').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Resumen_Ejecutivo_${cleanTitle}.pdf`);
  };

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);

    try {
      const reportElem =
        document.getElementById('full-report-container') ||
        document.getElementById('executive-report-content');

      if (!reportElem) {
        generateJsPDFTextFallback();
        return;
      }

      const canvas = await html2canvas(reportElem, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc',
        ignoreElements: (element) => element.classList.contains('no-print'),
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('style').forEach((styleTag) => {
            if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
              styleTag.textContent = oklchToRgb(styleTag.textContent);
            }
          });

          try {
            const stylesheets = Array.from(clonedDoc.styleSheets);
            stylesheets.forEach((sheet) => {
              try {
                const rules = sheet.cssRules || sheet.rules;
                if (!rules) return;
                for (let i = 0; i < rules.length; i++) {
                  const rule = rules[i];
                  if (rule.cssText && rule.cssText.includes('oklch')) {
                    const newText = oklchToRgb(rule.cssText);
                    try {
                      sheet.deleteRule(i);
                      sheet.insertRule(newText, i);
                    } catch {
                      // Rule replacement fallback ignored
                    }
                  }
                }
              } catch {
                // Ignore restricted stylesheets
              }
            });
          } catch {
            // Ignore stylesheet access errors
          }

          clonedDoc.querySelectorAll('*').forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && htmlEl.style.cssText && htmlEl.style.cssText.includes('oklch')) {
              htmlEl.style.cssText = oklchToRgb(htmlEl.style.cssText);
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - margin * 2;
      }

      const cleanTitle = (analysis.title || 'Resumen').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Resumen_Ejecutivo_${cleanTitle}.pdf`);
    } catch (err) {
      console.error('Canvas PDF export failed, falling back to jsPDF text layout:', err);
      generateJsPDFTextFallback();
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDownloadText = () => {
    const summaryContent = `==================================================
${analysis.title.toUpperCase()}
==================================================
Tipo de Documento: ${analysis.documentType.toUpperCase()}
Fecha de Generación: ${analysis.timestamp}
Audiencia: ${audienceMode.toUpperCase()}

--------------------------------------------------
RESUMEN EJECUTIVO (${audienceMode.toUpperCase()})
--------------------------------------------------
${currentSummaryText || analysis.summary}

--------------------------------------------------
INDICADORES CLAVE Y MÉTRICAS (KPIs)
--------------------------------------------------
${(analysis.kpis || []).map(k => `• ${k.label}: ${k.value} (${k.change || 'N/A'}) ${k.description ? `- ${k.description}` : ''}`).join('\n')}

--------------------------------------------------
PUNTOS CLAVE Y CONCLUSIONES DESTACADAS
--------------------------------------------------
${(analysis.keyTakeaways || []).map((t, i) => `${i + 1}. ${t}`).join('\n')}

--------------------------------------------------
RECOMENDACIONES DE ACCIÓN
--------------------------------------------------
${(analysis.recommendations || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}

${analysis.risksAndOpportunities ? `
--------------------------------------------------
RIESGOS IDENTIFICADOS
--------------------------------------------------
${(analysis.risksAndOpportunities.risks || []).map(r => `• ${r}`).join('\n')}

--------------------------------------------------
OPORTUNIDADES ESTRATÉGICAS
--------------------------------------------------
${(analysis.risksAndOpportunities.opportunities || []).map(o => `• ${o}`).join('\n')}
` : ''}
==================================================
Generado por DataLens AI • Gemini AI Studio
==================================================`;

    const blob = new Blob([summaryContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resumen_Ejecutivo_${analysis.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const summaryContent = `=== ${analysis.title} ===\n${currentSummaryText || analysis.summary}`;
    navigator.clipboard.writeText(summaryContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="executive-report-content" className="space-y-6">
      {/* Header & Main Executive Summary Card - Deep Indigo Geometric Balance Card */}
      <div className="bg-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-500/50">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              {getDocumentTypeBadge(analysis.documentType)}
              <span className="text-xs font-mono text-indigo-100/80">
                Generado: {analysis.timestamp}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {analysis.title}
            </h2>
          </div>

          {/* Mode Switcher Tabs inside Header */}
          <div className="flex items-center bg-indigo-900/40 p-1 rounded-xl border border-indigo-400/30 text-xs">
            <button
              onClick={() => onAudienceModeChange('executive')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                audienceMode === 'executive'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              Modo Ejecutivo
            </button>
            <button
              onClick={() => onAudienceModeChange('general_public')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                audienceMode === 'general_public'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              Para Todo Público
            </button>
            <button
              onClick={() => onAudienceModeChange('technical')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                audienceMode === 'technical'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              Técnico Informativo
            </button>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="mt-6 flex gap-4 items-start">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100 mb-2">
              {audienceMode === 'executive'
                ? 'Resumen Ejecutivo de Alto Nivel'
                : audienceMode === 'general_public'
                ? 'Explicación Sencilla y Divulgativa'
                : 'Análisis Técnico y Estadístico'}
            </h3>
            <p className="text-sm sm:text-base text-indigo-50 leading-relaxed italic">
              "{currentSummaryText || analysis.summary}"
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {analysis.kpis && analysis.kpis.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
            Indicadores Clave y Métricas Procesadas (KPIs):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysis.kpis.map((kpi, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between text-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase mb-1">
                    <span className="truncate">{kpi.label}</span>
                    {getTrendIcon(kpi.trend)}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {kpi.value}
                  </div>
                </div>

                {kpi.change && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">{kpi.description || 'Variación'}</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-50 text-indigo-700 text-[11px] border border-indigo-100">
                      {kpi.change}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Takeaways & Recommendations Two Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conclusions / Takeaways */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Puntos Clave y Conclusiones Destacadas</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-700">
            {(analysis.keyTakeaways || []).map((takeaway, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5 border border-emerald-200">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            <span>Recomendaciones de Acción Sugeridas</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-700">
            {(analysis.recommendations || []).map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <ArrowUpRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Risks and Opportunities */}
      {analysis.risksAndOpportunities && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900">
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 mb-3 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Riesgos Identificados / Alertas</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {(analysis.risksAndOpportunities.risks || []).map((risk, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-900">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Oportunidades Estratégicas</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {(analysis.risksAndOpportunities.opportunities || []).map((opp, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Export / Download PDF Summary Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 no-print">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">¿Deseas guardar o exportar este resumen?</h4>
          </div>
          <p className="text-xs text-slate-300">
            Descarga el informe analítico completo en formato PDF o como documento de texto para compartirlo con tu equipo, profesores o cliente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="download-pdf-btn"
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isExportingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar Resumen en PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadText}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-indigo-300" />
            <span>Exportar TXT</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
