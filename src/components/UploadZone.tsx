import React, { useState } from 'react';
import { Upload, FileText, Camera, Image, Sparkles, AlertCircle, FileCheck, X } from 'lucide-react';
import { AudienceMode } from '../types';

interface UploadZoneProps {
  onAnalyze: (payload: {
    inputType: 'text' | 'image' | 'file';
    textContent?: string;
    base64Data?: string;
    mimeType?: string;
    fileName?: string;
    audienceMode: AudienceMode;
  }) => void;
  isLoading: boolean;
  audienceMode: AudienceMode;
  onAudienceModeChange: (mode: AudienceMode) => void;
  onOpenCamera: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onAnalyze,
  isLoading,
  audienceMode,
  onAudienceModeChange,
  onOpenCamera,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    base64Data: string;
    previewUrl?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result;

      // Calculate formatted size
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeKB = (file.size / 1024).toFixed(0);
      const formattedSize = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

      setSelectedFile({
        name: file.name,
        size: formattedSize,
        type: file.type || 'application/octet-stream',
        base64Data,
        previewUrl: file.type.startsWith('image/') ? result : undefined,
      });
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (activeTab === 'file' && selectedFile) {
      onAnalyze({
        inputType: selectedFile.type.startsWith('image/') ? 'image' : 'file',
        base64Data: selectedFile.base64Data,
        mimeType: selectedFile.type,
        fileName: selectedFile.name,
        audienceMode,
      });
    } else if (activeTab === 'text' && pastedText.trim()) {
      onAnalyze({
        inputType: 'text',
        textContent: pastedText,
        fileName: 'Entrada de texto / informe',
        audienceMode,
      });
    }
  };

  return (
    <div className="bg-zinc-950 border border-purple-900/50 text-zinc-100 rounded-2xl p-6 shadow-sm">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/50">
        <div className="flex items-center space-x-2 bg-zinc-900 p-1 rounded-xl border border-purple-800/50">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'file'
                ? 'bg-fuchsia-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-fuchsia-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir Archivo / Imagen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-fuchsia-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-fuchsia-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Pegar Texto / Datos</span>
          </button>
        </div>

        {/* Live Camera Button */}
        <button
          type="button"
          onClick={onOpenCamera}
          className="flex items-center space-x-2 px-3.5 py-2 bg-zinc-900 hover:bg-purple-900/50 text-zinc-300 border border-purple-800/50 rounded-xl text-xs font-semibold transition-colors"
        >
          <Camera className="w-4 h-4 text-fuchsia-500" />
          <span className="hidden sm:inline">Foto de Factura</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {activeTab === 'file' ? (
          <div>
            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-purple-800/50 hover:border-fuchsia-500 rounded-2xl p-8 text-center bg-black transition-all group cursor-pointer"
              >
                <input
                  type="file"
                  id="file-upload-input"
                  onChange={handleFileChange}
                  accept="image/*,.txt,.csv,.json,.md,.doc,.pdf"
                  className="hidden"
                />
                <label htmlFor="file-upload-input" className="cursor-pointer block">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 group-hover:bg-purple-900/40 text-fuchsia-500 flex items-center justify-center mx-auto mb-3 transition-colors border border-purple-800/50 group-hover:border-fuchsia-500 shadow-sm">
                    <Image className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-100 mb-1">
                    Arrastra tu archivo aquí o haz clic para explorar
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-3">
                    Fotos de facturas (JPG, PNG), documentos de investigación, reportes en PDF/TXT o tablas de datos CSV.
                  </p>
                  <span className="inline-block px-4 py-2 bg-zinc-800 text-white text-xs font-semibold rounded-lg group-hover:bg-fuchsia-600 transition-all">
                    Seleccionar Archivo
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-black p-4 rounded-2xl border border-purple-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedFile.previewUrl ? (
                    <img
                      src={selectedFile.previewUrl}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-purple-800/50 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-fuchsia-500">
                      <FileCheck className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-zinc-100 max-w-xs truncate">
                      {selectedFile.name}
                    </h5>
                    <p className="text-[11px] text-zinc-400">{selectedFile.size} • {selectedFile.type || 'Documento'}</p>
                    <span className="inline-block mt-1 text-[10px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-700/50 font-mono font-medium">
                      Listo para análisis
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-zinc-500 hover:text-fuchsia-400 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Pega aquí el texto de una factura, resumen de investigación universitaria, reporte de ingresos o datos brutos..."
              className="w-full bg-black border border-purple-800/50 focus:border-fuchsia-500 rounded-2xl p-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* Audience Selector Radio Group inside Upload */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-purple-900/50">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Audiencia:</span>
            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-purple-800/50 text-[11px] font-semibold w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onAudienceModeChange('executive')}
                className={`px-3 py-1 rounded-lg transition-all text-center ${
                  audienceMode === 'executive'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-fuchsia-300'
                }`}
              >
                Ejecutivo
              </button>
              <button
                type="button"
                onClick={() => onAudienceModeChange('general_public')}
                className={`px-3 py-1 rounded-lg transition-all text-center ${
                  audienceMode === 'general_public'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-fuchsia-300'
                }`}
              >
                Público
              </button>
              <button
                type="button"
                onClick={() => onAudienceModeChange('technical')}
                className={`px-3 py-1 rounded-lg transition-all text-center ${
                  audienceMode === 'technical'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-fuchsia-300'
                }`}
              >
                Técnico
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (activeTab === 'file' ? !selectedFile : !pastedText.trim())}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-fuchsia-900/50 transition-all disabled:opacity-40 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analizando con Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Transformar & Generar Análisis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};