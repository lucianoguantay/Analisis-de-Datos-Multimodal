import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, RefreshCw, FileImage } from 'lucide-react';

interface DiagramGeneratorProps {
  reportTitle: string;
  documentType: string;
  keyTakeaways: string[];
  initialImageUrl?: string;
  onDiagramGenerated?: (url: string) => void;
}

export const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({
  reportTitle,
  documentType,
  keyTakeaways,
  initialImageUrl,
  onDiagramGenerated,
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateDiagram = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportTitle,
          documentType,
          keyTakeaways,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar la imagen infográfica.');
      }

      setImageUrl(data.imageUrl);
      if (onDiagramGenerated) {
        onDiagramGenerated(data.imageUrl);
      }
    } catch (err: any) {
      console.error('Diagram generation error:', err);
      setError(err.message || 'Error al generar la imagen.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadJPG = async () => {
    if (!imageUrl) return;
    setIsDownloading(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = imageUrl;
      });

      const canvas = document.createElement('canvas');
      const width = img.naturalWidth || 1200;
      const height = img.naturalHeight || 675;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo crear el lienzo de conversión.');

      // Solid white background for JPG format
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPG Blob and trigger download
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('No se pudo generar el archivo JPG.');
          }

          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const cleanTitle = (reportTitle || 'Infografia').replace(/[^a-zA-Z0-9]/g, '_');
          link.href = blobUrl;
          link.download = `Infografia_${cleanTitle}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          setIsDownloading(false);
        },
        'image/jpeg',
        0.92
      );
    } catch (err: any) {
      console.error('Download JPG failed, using direct download fallback:', err);
      try {
        const link = document.createElement('a');
        const cleanTitle = (reportTitle || 'Infografia').replace(/[^a-zA-Z0-9]/g, '_');
        link.href = imageUrl;
        link.download = `Infografia_${cleanTitle}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        setError('No se pudo descargar la imagen automáticamente.');
      }
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Infografía Visual e Ilustración de Resumen (IA)
            </h3>
            <p className="text-xs text-slate-500">
              Genera una representación gráfica moderna para acompañar la presentación ejecutiva.
            </p>
          </div>
        </div>

        <button
          onClick={generateDiagram}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generando imagen...</span>
            </>
          ) : imageUrl ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerar Infografía</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generar Infografía Ilustrada</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      {imageUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-sm">
          <img
            src={imageUrl}
            alt="Infografía Resumen"
            className="w-full h-auto max-h-96 object-contain mx-auto"
          />
          <div className="p-3 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-indigo-400" />
              Infografía lista para guardar
            </span>

            <button
              onClick={handleDownloadJPG}
              disabled={isDownloading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando JPG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar Infografía (.JPG)</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50">
          <p className="text-xs text-slate-600">
            Haz clic en <strong className="text-indigo-600">"Generar Infografía Ilustrada"</strong> para crear una ilustración visual estilizada con gráficos corporativos basada en las métricas clave de este informe.
          </p>
        </div>
      )}
    </div>
  );
};

