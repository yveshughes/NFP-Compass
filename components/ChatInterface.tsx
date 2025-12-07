
import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Send, Bot, Loader2, Mic, CameraOff, MessageSquare, Headphones, Eye, Aperture, X, Play, Monitor, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { playTextToSpeech } from '../services/elevenLabsService';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, image?: string) => void;
  onNavigate?: (url: string) => void;
  onFileUpload?: (file: File) => void;
}

type ChatMode = 'text' | 'voice' | 'vision' | 'screen';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, onNavigate, onFileUpload }) => {
  const [mode, setMode] = useState<ChatMode>('text');
  const [inputText, setInputText] = useState('');
  
  // Media States
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [voiceSessionStarted, setVoiceSessionStarted] = useState(false);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState<string | null>(null);
  
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

  // Cleanup media on unmount or mode switch
  useEffect(() => {
    return () => {
        stopMediaStream();
        window.speechSynthesis.cancel();
    };
  }, []);

  // Handle Mode Switching Cleanup
  useEffect(() => {
    // When switching OUT of vision, stop camera
    if (mode !== 'vision' && isCameraOn) {
        stopMediaStream();
        setIsCameraOn(false);
    }

    // When switching OUT of voice, stop listening/speaking and reset session
    if (mode !== 'voice') {
        window.speechSynthesis.cancel();
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        setVoiceSessionStarted(false);
    }
  }, [mode]);


  const stopMediaStream = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  };
  // --- ELEVENLABS INTEGRATION ---
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (mode === 'voice' && voiceSessionStarted && lastMessage && lastMessage.role === 'model' && lastMessage.id !== lastSpokenMessageId && !isLoading) {
        const playResponse = async () => {
            const audio = await playTextToSpeech(lastMessage.text);
            if (audio) {
                audio.onended = () => {
                    if (recognitionRef.current) {
                        try {
                            recognitionRef.current.start();
                            setIsListening(true);
                        } catch (e) {
                            console.error("Failed to auto-start recognition", e);
                        }
                    }
                };
            }
        };
        playResponse();
        setLastSpokenMessageId(lastMessage.id);
    }
  }, [messages, mode, isLoading, lastSpokenMessageId, voiceSessionStarted]);

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
  }, [mode]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Your browser does not support speech recognition.");
        return;
    }
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (e) {
            console.error("Failed to start recognition", e);
        }
    }
  };

  const handleStartVoiceSession = () => {
      setVoiceSessionStarted(true);
      // Delay listening slightly to let the greeting start
      setTimeout(() => {
        if (!isListening) toggleListening();
      }, 800);
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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      // Reset the input
      e.target.value = '';
    }
  };

  // --- VIEW: TEXT MODE ---
  const renderTextMode = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide pb-6">
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          const shouldShowShareButton = msg.role === 'model' && isLastMessage && !isLoading &&
            (msg.text.toLowerCase().includes('share screen') || msg.text.toLowerCase().includes('📸'));

          return (
            <div key={msg.id}>
              <div className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                            a: ({node, href, ...props}) => (
                              <a
                                href={href}
                                className="text-[var(--theme-primary)] hover:underline cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (href && onNavigate) {
                                    onNavigate(href);
                                  }
                                }}
                                title={href}
                                {...props}
                              />
                            ),
                        }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>

              {/* Share Screen Button After Last Gemma Message */}
              {shouldShowShareButton && (
                <div className="flex gap-4 mt-3 ml-12">
                  <button
                    onClick={captureScreen}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl shadow-md font-semibold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
                  >
                    <Monitor className="w-4 h-4" />
                    📸 Share Screen
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
          {onFileUpload && (
            <label className="p-2.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0">
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                disabled={isLoading}
              />
            </label>
          )}
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
        <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--theme-primary)] rounded-full blur-3xl animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {!voiceSessionStarted ? (
            // START SCREEN
            <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center mb-6 shadow-2xl border border-slate-700">
                    <Headphones className="w-10 h-10 text-[var(--theme-primary)]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Voice Mode</h2>
                <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">
                    Talk to Gemma hands-free. She can answer questions, draft documents, and guide you through the process.
                </p>
                <button
                    onClick={handleStartVoiceSession}
                    className="group relative flex items-center gap-3 px-8 py-4 bg-[var(--theme-primary)] rounded-full text-white font-semibold text-lg hover:brightness-110 transition-all shadow-[0_0_40px_-10px_var(--theme-primary)] hover:scale-105 active:scale-95"
                >
                    <Play className="w-5 h-5 fill-current" />
                    Start Conversation
                </button>
            </div>
        ) : (
            // ACTIVE SESSION SCREEN
            <div className="relative z-10 flex flex-col items-center animate-in fade-in duration-500">
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
                            {isLoading ? "GEMMA IS THINKING..." : "LISTENING..."}
                        </span>
                    )}
                </div>

                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening
                    ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    : 'bg-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                }`}>
                    <Mic className={`w-6 h-6 ${isListening ? 'text-white' : 'text-white/60'}`} />
                </div>
            </div>
        )}

        {/* Last Message Context (Only show if session started) */}
        {voiceSessionStarted && (
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
                <div className="max-w-md mx-auto text-center">
                    {messages.length > 0 && messages[messages.length - 1].role === 'model' && (
                        <p className="text-slate-300 text-sm italic opacity-80 line-clamp-2">
                            "{messages[messages.length - 1].text}"
                        </p>
                    )}
                </div>
            </div>
        )}
    </div>
  );

  // --- CAPTURE FROM WEBCAM ---
  const captureFromWebcam = () => {
    const video = visionVideoRef.current;
    if (!video) return;

    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw current video frame
    ctx.drawImage(video, 0, 0);

    // Convert to base64 PNG (keep full data URL for geminiService to process)
    const base64Image = canvas.toDataURL('image/png');

    // Send to Gemini with general prompt - let user type what they want
    onSendMessage(
      "What do you see in this image?",
      base64Image
    );
  };

  // --- VIEW: VISION MODE (Camera) ---
  const renderVisionMode = () => (
    <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 relative flex flex-col">
        {/* Video Feed or Placeholder */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {isCameraOn ? (
                <div className="relative w-full h-full flex items-center justify-center">
                    <video
                        ref={visionVideoRef}
                        autoPlay
                        playsInline
                        className="max-w-full max-h-full object-contain rounded-xl"
                    />
                    {/* Capture hint overlay */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-white text-sm animate-pulse">
                        📸 Show Gemma what you want to discuss, then click Capture
                    </div>
                </div>
            ) : (
                <div className="text-center max-w-md px-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                        <Eye className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Vision Mode</h3>
                    <p className="text-slate-300 mb-6">
                        Show Gemma documents, designs, products, or anything visual for real-time analysis and feedback.
                    </p>
                    <div className="space-y-3 text-sm text-slate-400 text-left bg-white/5 rounded-lg p-4">
                        <div className="flex gap-3">
                            <span className="text-lg">1️⃣</span>
                            <p>Turn on your camera below</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-lg">2️⃣</span>
                            <p>Show Gemma what you want to discuss</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-lg">3️⃣</span>
                            <p>Click Capture and then type your question</p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Vision Controls */}
        <div className="h-24 bg-slate-900/50 backdrop-blur flex items-center justify-center gap-4 border-t border-slate-700 shrink-0">
             <button
                onClick={() => toggleCamera(visionVideoRef)}
                className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform ${
                    isCameraOn ? 'bg-red-500 text-white' : 'bg-white text-slate-900'
                }`}
             >
                {isCameraOn ? <CameraOff className="w-5 h-5" /> : <Aperture className="w-5 h-5" />}
                {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
             </button>

             {isCameraOn && (
                <button
                    onClick={captureFromWebcam}
                    disabled={isLoading}
                    className="px-8 py-3 rounded-full font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/50"
                >
                    <Aperture className="w-5 h-5" />
                    {isLoading ? 'Analyzing...' : 'Capture'}
                </button>
             )}
        </div>
    </div>
  );

  // --- VIEW: SCREEN SHARE MODE ---
  const captureScreen = async () => {
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Convert to base64
      const imageData = canvas.toDataURL('image/png');

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Send to Gemini with the screenshot
      onSendMessage("What do I need to fill out on this page? Guide me through each field.", imageData);

    } catch (error) {
      console.error('Screen capture failed:', error);
      alert('Screen capture was cancelled or failed. Please try again.');
    }
  };

  const renderScreenMode = () => (
    <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 relative flex flex-col">
        {/* Screen Share Instructions */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Monitor className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Screen Share Mode</h3>
                <p className="text-slate-300 mb-6">
                    Share your screen with Gemma to get guidance on filling out forms, navigating websites, or understanding documents.
                </p>
                <div className="space-y-3 text-sm text-slate-400 text-left bg-white/5 rounded-lg p-4">
                    <div className="flex gap-3">
                        <span className="text-lg">1️⃣</span>
                        <p>Click "Capture Screen" below</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-lg">2️⃣</span>
                        <p>Select the browser tab or window with the form</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-lg">3️⃣</span>
                        <p>Gemma will analyze and guide you through filling it out</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Screen Share Controls */}
        <div className="h-24 bg-slate-900/50 backdrop-blur flex items-center justify-center gap-8 border-t border-slate-700 shrink-0">
             <button
                onClick={captureScreen}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
             >
                <Monitor className="w-5 h-5" />
                Capture Screen
             </button>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* Top Tabs (Segmented Control) */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-center shrink-0">
        <div className="flex bg-slate-100/80 p-1 rounded-lg">
            <button
                onClick={() => setMode('voice')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'voice' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={mode === 'voice' ? { color: 'var(--theme-primary)' } : {}}
            >
                <Headphones className="w-3.5 h-3.5" />
                Voice
            </button>
            <button
                onClick={() => setMode('text')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'text' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={mode === 'text' ? { color: 'var(--theme-primary)' } : {}}
            >
                <MessageSquare className="w-3.5 h-3.5" />
                Text
            </button>
            <button
                onClick={() => setMode('vision')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'vision' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={mode === 'vision' ? { color: 'var(--theme-primary)' } : {}}
            >
                <Eye className="w-3.5 h-3.5" />
                Vision
            </button>
            <button
                onClick={() => setMode('screen')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'screen' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={mode === 'screen' ? { color: 'var(--theme-primary)' } : {}}
            >
                <Monitor className="w-3.5 h-3.5" />
                Screen
            </button>
        </div>
      </div>

      {/* Main Content Render */}
      {mode === 'text' && renderTextMode()}
      {mode === 'voice' && renderVoiceMode()}
      {mode === 'vision' && renderVisionMode()}
      {mode === 'screen' && renderScreenMode()}

    </div>
  );
};

export default ChatInterface;
