import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Data: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError('No se pudo acceder a la cámara. Asegúrate de otorgar permisos en el navegador.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleAccept = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 shadow-2xl relative text-slate-100 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-base">Tomar foto de factura o documento</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800">
          {cameraError ? (
            <div className="p-6 text-center text-rose-400 text-sm">
              <p>{cameraError}</p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captura" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Enfoca la factura, tabla o documento claramente antes de disparar.
          </p>

          <div className="flex items-center space-x-2">
            {capturedImage ? (
              <>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex items-center space-x-1 px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Repetir</span>
                </button>
                <button
                  onClick={handleAccept}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Usar esta foto</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSnap}
                disabled={!!cameraError}
                className="flex items-center space-x-2 px-5 py-2.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar Foto</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
