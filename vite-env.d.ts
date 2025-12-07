/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_ELEVENLABS_API_KEY: string;
  readonly VITE_STEEL_API_KEY: string;
  readonly STEEL_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}
