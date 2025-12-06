import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Send, Bot, User, Loader2, Mic, MicOff, Camera, CameraOff, GripVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  
  // Docking & Drag State
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 }); // Mouse position relative to element top-left
  const hasMovedRef = useRef(false);

  // Media Refs
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Cleanup media on unmount
  useEffect(() => {
    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };
  }, []);

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
            setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
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
  }, []);

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

  // --- CAMERA ---
  const toggleCamera = async () => {
    if (isCameraOn) {
        // Stop camera
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOn(false);
    } else {
        // Start camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            setIsCameraOn(true);
            // We need a slight delay to let the video element render if it wasn't there
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  // --- DRAG HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    hasMovedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);

    if (isDocked) {
        // Undock logic: Calculate current screen position to switch to fixed without jumping
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.top });
        setIsDocked(false);
        // Calculate offset from the top-left of the element
        dragStartRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    } else {
        // Already undocked
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    // Threshold to prevent accidental micro-drags being counted as moves
    if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
        hasMovedRef.current = true;
    }

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // Check for docking proximity if currently undocked
    if (!isDocked && dockRef.current) {
        const dockRect = dockRef.current.getBoundingClientRect();
        const dist = Math.hypot(position.x - dockRect.left, position.y - dockRect.top);
        
        // Snap distance threshold (e.g., 100px)
        if (dist < 100) {
            setIsDocked(true);
            return; // Exit, don't trigger clicks
        }
    }

    // Only trigger clicks if we didn't drag
    if (!hasMovedRef.current) {
       // Logic to determine which button was clicked is handled by child onClick propagation
       // But since the parent captures pointer, we might need to rely on the target check inside the buttons
    }
  };

  // --- COMPONENT: MEDIA CAPSULE ---
  const MediaCapsule = () => (
    <div 
        className={`flex items-center gap-2 p-1.5 rounded-full shadow-lg transition-colors duration-200 cursor-grab active:cursor-grabbing border border-slate-700/50 ${isDragging ? 'scale-105 shadow-xl' : ''} ${isListening || isCameraOn ? 'bg-slate-900' : 'bg-slate-800'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
    >
        {/* Grip Handle */}
        <div className="pl-1 pr-0.5 text-slate-500">
            <GripVertical className="w-4 h-4" />
        </div>

        {/* Mic Toggle */}
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleListening(); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
        >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
             type="button"
             onClick={(e) => { e.stopPropagation(); toggleCamera(); }}
             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                 isCameraOn
                 ? 'bg-green-500 text-white' 
                 : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
             }`}
        >
             {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
        </button>

        {/* Video Preview (Attached) */}
        {isCameraOn && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-black rounded-lg overflow-hidden shadow-xl border-2 border-slate-800">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-auto object-cover transform -scale-x-100" // Mirror effect
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                     <span className="text-[10px] text-white font-medium uppercase">Live</span>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide pb-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none prose prose-sm prose-blue max-w-none'
              }`}
            >
              {msg.role === 'user' ? (
                <div>{msg.text}</div>
              ) : (
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        code: ({node, ...props}) => <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                >
                    {msg.text}
                </ReactMarkdown>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span className="text-slate-400 text-xs font-medium">Gemma is thinking...</span>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Dock Area */}
      <div className="p-4 border-t border-slate-100 bg-white flex items-end gap-3 z-10">
        
        {/* The Dock */}
        <div ref={dockRef} className="shrink-0 w-[120px] h-[54px] relative flex items-center justify-center">
            {isDocked ? (
                <MediaCapsule />
            ) : (
                <div className="w-full h-12 rounded-full border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center text-xs text-slate-300 select-none">
                    Drop to Dock
                </div>
            )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all h-[54px]">
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-800 placeholder:text-slate-400 px-3 h-full"
            placeholder={isListening ? "Listening..." : "Type your message..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Floating Media Capsule (When Undocked) */}
      {!isDocked && (
        <div 
            style={{ 
                position: 'fixed', 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                touchAction: 'none'
            }}
            className="z-50"
        >
            <MediaCapsule />
        </div>
      )}

    </div>
  );
};

export default ChatInterface;