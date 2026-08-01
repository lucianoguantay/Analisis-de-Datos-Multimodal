import React, { useState } from 'react';
import { AnalysisResult, ChatMessage } from '../types';
import { MessageSquare, Send, Bot, User, Sparkles, Copy, Check } from 'lucide-react';

interface DataChatProps {
  analysis: AnalysisResult;
}

export const DataChat: React.FC<DataChatProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hola, soy tu asistente DataLens AI. He analizado el documento **"${analysis.title}"**. ¿Tienes alguna pregunta específica, quieres que redacte un correo ejecutivo para presentar estos datos o que te explique algún punto en detalle?`,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisContext: {
            title: analysis.title,
            documentType: analysis.documentType,
            summary: analysis.summary,
            kpis: analysis.kpis,
            keyTakeaways: analysis.keyTakeaways,
          },
          userMessage: text,
          history: messages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en respuesta del asistente.');

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: data.responseText,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: 'Ocurrió un error al consultar a la IA: ' + (err.message || 'Inténtalo nuevamente.'),
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputValue(promptText);
  };

  const copyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-slate-900 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Asistente Interactivo de Consultas (DataLens Chat)
          </h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
          Gemini 3.6 Flash
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() =>
            handleQuickPrompt('Redacta un correo profesional para mi jefe/profesor presentando los hallazgos principales.')
          }
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
        >
          ✉️ Redactar correo ejecutivo
        </button>
        <button
          onClick={() =>
            handleQuickPrompt('¿Cuáles son los 3 mayores costos o riesgos identificados y cómo solucionarlos?')
          }
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
        >
          ⚠️ Profundizar en riesgos
        </button>
        <button
          onClick={() =>
            handleQuickPrompt('Explícame los conceptos financieros o técnicos en palabras muy simples.')
          }
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
        >
          💡 Explicación sin jerga
        </button>
      </div>

      {/* Message history */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-80 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl rounded-2xl px-4 py-2.5 text-xs relative group ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-sm font-medium'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div
                className={`mt-1 flex items-center justify-between text-[10px] ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => copyText(msg.id, msg.text)}
                    className="ml-2 hover:text-slate-900"
                    title="Copiar respuesta"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Haz una pregunta sobre esta factura o informe..."
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isSending || !inputValue.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-40 cursor-pointer flex items-center space-x-1 shrink-0"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};
