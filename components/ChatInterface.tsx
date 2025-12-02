import React, { useState, useRef, useEffect } from 'react';
import { getChatSession } from '../services/geminiService';
import { ChatMessage, ElementType } from '../types';
import { Send, X, Loader2, Sparkles, Bot, Terminal } from 'lucide-react';
import { GenerateContentResponse, Part } from '@google/genai';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  // Tool Executors
  onAddElement: (type: ElementType, content?: string, style?: any) => void;
  onUpdateBackground: (color: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    isOpen, 
    onClose, 
    onOpen,
    onAddElement,
    onUpdateBackground
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm DesignGenius. I can create designs for you. Try saying 'Add a blue circle' or 'Create a sale banner'.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, toolStatus]);

  const executeToolCall = async (functionCall: any): Promise<Part> => {
      const { name, args, id } = functionCall;
      console.log(`🛠️ Executing Tool: ${name}`, args);
      
      setToolStatus(`Generating ${name}...`);

      try {
          let result = "Done";

          if (name === 'addElement') {
              // Extract style properties to pass separately
              const { type, content, x, y, width, height, ...restStyle } = args;
              
              // Construct the style object for the app's addElement function
              const styleOverrides = {
                  x, y, width, height,
                  ...restStyle
              };
              
              onAddElement(type, content, styleOverrides);
              result = `Added ${type} at ${x},${y}`;
          } 
          else if (name === 'changeBackground') {
              onUpdateBackground(args.color);
              result = `Changed background to ${args.color}`;
          }

          // Small delay for visual feedback
          await new Promise(r => setTimeout(r, 500));
          
          return {
              functionResponse: {
                  name: name,
                  response: { result: result },
                  id: id
              }
          };

      } catch (error) {
          console.error("Tool execution error", error);
          return {
              functionResponse: {
                  name: name,
                  response: { error: "Failed to execute tool" },
                  id: id
              }
          };
      } finally {
          setToolStatus(null);
      }
  };

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
      const chat = getChatSession();
      
      // 1. Send User Message
      let result = await chat.sendMessage({ message: userMessage.text });
      
      // 2. Loop to handle Tool Calls (Model might want to call multiple tools or think then call)
      // We loop until the model returns plain text (stop reason) or we hit a limit
      let loopCount = 0;
      const MAX_LOOPS = 5;

      while (loopCount < MAX_LOOPS) {
          
          // Check for Tool Calls
          // The SDK parses functionCalls into `result.functionCalls`
          const functionCalls = result.functionCalls;

          if (functionCalls && functionCalls.length > 0) {
             // Execute all requested tools
             const toolParts: Part[] = [];
             for (const call of functionCalls) {
                 const part = await executeToolCall(call);
                 toolParts.push(part);
             }

             // Send results back to model
             if (toolParts.length > 0) {
                // The SDK expects the message parameter to contain the parts
                result = await chat.sendMessage({ message: toolParts });
             } else {
                 break;
             }
          } else {
              // No tool calls, we have the final text response
              break;
          }
          loopCount++;
      }

      // 3. Display Final Response
      const botText = result.text;
      if (botText) {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              text: botText,
              timestamp: new Date()
          }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered a hiccup. Please try again.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      setToolStatus(null);
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
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-xl hover:scale-105 transition-all z-50 flex items-center gap-2 group"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform"/>
        <span className="font-semibold hidden md:inline">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">DesignGenius</h3>
            <p className="text-[10px] text-indigo-100 flex items-center gap-1 opacity-90">
              <Sparkles size={8} /> Powered by Gemini
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
              } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {/* Tool Status Indicator */}
        {toolStatus && (
             <div className="flex justify-start">
                 <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium border border-indigo-100 animate-pulse">
                     <Terminal size={12} />
                     {toolStatus}
                 </div>
             </div>
        )}

        {isLoading && !toolStatus && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
              <Loader2 className="animate-spin text-indigo-600" size={20} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
         {messages.length < 3 && (
             <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-1">
                 {['Add a red circle', 'Create a hero section', 'Make background dark'].map(hint => (
                     <button 
                        key={hint} 
                        onClick={() => setInput(hint)}
                        className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors font-medium"
                     >
                         {hint}
                     </button>
                 ))}
             </div>
         )}

        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:bg-white transition-all border border-slate-200">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your design..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;