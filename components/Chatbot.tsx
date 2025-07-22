
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import SendIcon from './icons/SendIcon';
import CloseIcon from './icons/CloseIcon';
import { logoBase64 } from './logo';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div
      className={`fixed bottom-24 right-8 w-[90vw] max-w-lg h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-500 ease-in-out transform z-50
      ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-title"
    >
      <header className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <img src={logoBase64} alt="GEE Logo" className="h-8 w-auto" />
          <h2 id="chatbot-title" className="text-lg font-bold text-teal-800">Asistente de Licitaciones</h2>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Cerrar chat">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto bg-slate-100/70">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-lg'
                    : 'bg-white text-slate-800 rounded-bl-lg shadow-sm border border-slate-200'
                }`}
              >
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-white text-slate-800 rounded-bl-lg shadow-sm border border-slate-200">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1.5">
                            <span className="h-2 w-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-teal-500 rounded-full animate-bounce"></span>
                        </div>
                        <p className="text-sm text-slate-500 italic">Escribiendo...</p>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t bg-white rounded-b-2xl">
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1 w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
            aria-label="Mensaje para el chatbot"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensaje"
            disabled={isLoading || !input.trim()}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;