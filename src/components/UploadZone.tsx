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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'file'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
          className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
        >
          <Camera className="w-4 h-4 text-indigo-600" />
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
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center bg-slate-50 transition-all group cursor-pointer"
              >
                <input
                  type="file"
                  id="file-upload-input"
                  onChange={handleFileChange}
                  accept="image/*,.txt,.csv,.json,.md,.doc,.pdf"
                  className="hidden"
                />
                <label htmlFor="file-upload-input" className="cursor-pointer block">
                  <div className="w-16 h-16 rounded-2xl bg-white group-hover:bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 transition-colors border border-slate-200 group-hover:border-indigo-400 shadow-sm">
                    <Image className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mb-1">
                    Arrastra tu archivo aquí o haz clic para explorar
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
                    Fotos de facturas (JPG, PNG), documentos de investigación, reportes en PDF/TXT o tablas de datos CSV.
                  </p>
                  <span className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg group-hover:bg-indigo-600 transition-all">
                    Seleccionar Archivo
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {selectedFile.previewUrl ? (
                    <img
                      src={selectedFile.previewUrl}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                      <FileCheck className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 max-w-xs truncate">
                      {selectedFile.name}
                    </h5>
                    <p className="text-[11px] text-slate-500">{selectedFile.size} • {selectedFile.type || 'Documento'}</p>
                    <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono font-medium">
                      Listo para análisis
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
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
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* Audience Selector Radio Group inside Upload */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audiencia:</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-semibold w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onAudienceModeChange('executive')}
                className={`px-3 py-1 rounded-lg transition-all text-center ${
                  audienceMode === 'executive'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ejecutivo
              </button>
              <button
                type="button"
                onClick={() => onAudienceModeChange('general_public')}
                className={`px-3 py-1 rounded-lg transition-all text-center ${
                  audienceMode === 'general_public'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Público
              </button>
              <button
                type="button"
                onClick={() => onAudienceModeChange('technical')}
                className={`px-3 py-1 rounded-lg transition-all text-center ${
                  audienceMode === 'technical'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Técnico
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (activeTab === 'file' ? !selectedFile : !pastedText.trim())}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-40 cursor-pointer"
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
