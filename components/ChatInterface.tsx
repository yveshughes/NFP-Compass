
import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Send, Bot, Loader2, Mic, CameraOff, MessageSquare, Headphones, Eye, Aperture, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

type ChatMode = 'text' | 'voice' | 'vision';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
  const [mode, setMode] = useState<ChatMode>('text');
  const [inputText, setInputText] = useState('');
  
  // Media States
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const visionVideoRef = useRef<HTMLVideoElement>(null); // Dedicated ref for Vision Mode
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (mode === 'text') {
        scrollToBottom();
    }
  }, [messages, isLoading, mode]);

  // Cleanup media on unmount
  useEffect(() => {
    return () => {
        stopMediaStream();
    };
  }, []);

  const stopMediaStream = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  };

  // --- SPEECH RECOGNITION ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            
            if (mode === 'voice') {
                // In voice mode, auto-send
                onSendMessage(transcript);
            } else {
                // In text mode, append to input
                setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
            }
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }
  }, [mode, onSendMessage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Your browser does not support speech recognition.");
        return;
    }
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  // --- CAMERA LOGIC ---
  const toggleCamera = async (targetRef: React.RefObject<HTMLVideoElement | null>) => {
    if (isCameraOn && streamRef.current) {
        stopMediaStream();
        setIsCameraOn(false);
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            setIsCameraOn(true);
            setTimeout(() => {
                if (targetRef.current) {
                    targetRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    }
  };

  // Effect to handle mode switching cleanup/setup
  useEffect(() => {
    // When switching OUT of vision, stop camera
    if (mode !== 'vision' && isCameraOn) {
        stopMediaStream();
        setIsCameraOn(false);
    }
    
    // When switching INTO vision, auto-start camera
    if (mode === 'vision') {
        stopMediaStream(); // Reset first
        setIsCameraOn(false);
        toggleCamera(visionVideoRef);
    }
  }, [mode]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  // --- VIEW: TEXT MODE ---
  const renderTextMode = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide pb-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-[var(--theme-primary)]" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' ? 'text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none prose prose-sm prose-blue max-w-none'
              }`}
              style={msg.role === 'user' ? { backgroundColor: 'var(--theme-primary)' } : {}}
            >
              {msg.role === 'user' ? (
                <div>{msg.text}</div>
              ) : (
                <ReactMarkdown components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />,
                        a: ({node, ...props}) => <a className="text-[var(--theme-primary)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                >
                    {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-[var(--theme-primary)]" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span className="text-slate-400 text-xs font-medium">Gemma is thinking...</span>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white z-10">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[var(--theme-primary-dim)] transition-all h-[54px]" style={{borderColor: 'transparent'}}>
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-800 px-3 h-full"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || isLoading} 
            className="p-2.5 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors shrink-0"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );

  // --- VIEW: VOICE MODE ---
  const renderVoiceMode = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--theme-primary)] rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Central Avatar */}
        <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-8">
                {isListening && <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{backgroundColor: 'var(--theme-primary)'}}></div>}
                <div 
                    className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-800"
                    style={{ background: 'linear-gradient(to bottom right, var(--theme-primary), #4f46e5)' }}
                >
                    {isLoading ? (
                        <Loader2 className="w-12 h-12 text-white/80 animate-spin" />
                    ) : (
                        <Bot className="w-12 h-12 text-white" />
                    )}
                </div>
            </div>

            <div className="h-12 flex items-center gap-1 mb-8">
                {isListening ? (
                    <>
                        <div className="w-2 rounded-full animate-wave" style={{backgroundColor: 'var(--theme-primary)'}}></div>
                        <div className="w-2 rounded-full animate-wave animate-wave-delay-1" style={{backgroundColor: 'var(--theme-primary)'}}></div>
                        <div className="w-2 rounded-full animate-wave animate-wave-delay-2" style={{backgroundColor: 'var(--theme-primary)'}}></div>
                        <div className="w-2 rounded-full animate-wave animate-wave-delay-3" style={{backgroundColor: 'var(--theme-primary)'}}></div>
                        <div className="w-2 rounded-full animate-wave animate-wave-delay-4" style={{backgroundColor: 'var(--theme-primary)'}}></div>
                    </>
                ) : (
                    <span className="text-slate-400 text-sm font-medium tracking-wide">
                        {isLoading ? "GEMMA IS THINKING..." : "TAP TO SPEAK"}
                    </span>
                )}
            </div>

            <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                    isListening 
                    ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                    : 'bg-white hover:bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                }`}
            >
                {isListening ? <Mic className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-slate-900" />}
            </button>
        </div>

        {/* Last Message Context */}
        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
             <div className="max-w-md mx-auto text-center">
                 {messages.length > 0 && messages[messages.length - 1].role === 'model' && (
                     <p className="text-slate-300 text-sm italic opacity-80 line-clamp-2">
                        "{messages[messages.length - 1].text}"
                     </p>
                 )}
             </div>
        </div>
    </div>
  );

  // --- VIEW: VISION MODE ---
  const renderVisionMode = () => (
    <div className="flex-1 bg-black relative flex flex-col">
        {/* Camera Feed */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {isCameraOn ? (
                <video 
                    ref={visionVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100 opacity-90"
                />
            ) : (
                <div className="text-slate-500 flex flex-col items-center">
                    <CameraOff className="w-12 h-12 mb-4 opacity-50" />
                    <p>Camera is off</p>
                    <button onClick={() => toggleCamera(visionVideoRef)} className="mt-4 px-4 py-2 bg-slate-800 rounded text-sm hover:bg-slate-700">Turn On</button>
                </div>
            )}
            
            {/* Overlay UI */}
            <div className="absolute inset-0 pointer-events-none border-[20px] border-slate-900/50">
                <div className="w-full h-full border-2 border-white/20 relative">
                     <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4" style={{borderColor: 'var(--theme-primary)'}}></div>
                     <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4" style={{borderColor: 'var(--theme-primary)'}}></div>
                     <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4" style={{borderColor: 'var(--theme-primary)'}}></div>
                     <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4" style={{borderColor: 'var(--theme-primary)'}}></div>
                </div>
            </div>
        </div>

        {/* Vision Controls */}
        <div className="h-24 bg-slate-900 flex items-center justify-center gap-8 border-t border-slate-800 shrink-0">
             <button onClick={() => { stopMediaStream(); setIsCameraOn(false); }} className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white">
                <X className="w-5 h-5" />
             </button>

             <button 
                onClick={() => onSendMessage("I've analyzed this visual context.")} // Placeholder for real vision API
                className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
             >
                <Aperture className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
             </button>

             <div className="w-12 h-12"></div> {/* Spacer for balance */}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* Top Tabs (Segmented Control) */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-center shrink-0">
        <div className="flex bg-slate-100/80 p-1 rounded-lg">
            <button 
                onClick={() => setMode('text')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'text' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={mode === 'text' ? { color: 'var(--theme-primary)' } : {}}
            >
                <MessageSquare className="w-4 h-4" />
                Text
            </button>
            <button 
                onClick={() => setMode('voice')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'voice' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={mode === 'voice' ? { color: 'var(--theme-primary)' } : {}}
            >
                <Headphones className="w-4 h-4" />
                Voice
            </button>
            <button 
                onClick={() => setMode('vision')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'vision' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={mode === 'vision' ? { color: 'var(--theme-primary)' } : {}}
            >
                <Eye className="w-4 h-4" />
                Vision
            </button>
        </div>
      </div>

      {/* Main Content Render */}
      {mode === 'text' && renderTextMode()}
      {mode === 'voice' && renderVoiceMode()}
      {mode === 'vision' && renderVisionMode()}

    </div>
  );
};

export default ChatInterface;
