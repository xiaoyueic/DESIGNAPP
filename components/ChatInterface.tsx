import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, X, MessageSquare, Loader2, Sparkles, Bot } from 'lucide-react';
import { GenerateContentResponse } from '@google/genai';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, onOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm your Design Assistant. Need help with a layout, color palette, or some catchy text?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const resultStream = await sendMessageToGemini(userMessage.text);
      
      const botMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'model',
        text: '', // Start empty
        timestamp: new Date()
      }]);

      let fullText = '';
      
      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullText += text;
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullText } : msg
        ));
        scrollToBottom();
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 flex items-center gap-2"
      >
        <Sparkles size={24} />
        <span className="font-semibold hidden md:inline">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={24} />
          <div>
            <h3 className="font-bold">Design Assistant</h3>
            <p className="text-xs text-purple-100 flex items-center gap-1">
              <Sparkles size={10} /> Powered by Gemini
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
              <Loader2 className="animate-spin text-purple-600" size={16} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for ideas or copy..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
