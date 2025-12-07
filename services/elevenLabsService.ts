import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.warn("ELEVENLABS_API_KEY is missing. Voice features will be disabled.");
}

const client = new ElevenLabsClient({
  apiKey: API_KEY
});

export const playTextToSpeech = async (text: string, voiceId: string = "uYXf8XasLslADfZ2MB4u"): Promise<HTMLAudioElement | undefined> => {
  if (!API_KEY) return undefined;

  try {
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    // Convert the stream to a Blob
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    await audio.play();
    return audio;
  } catch (error) {
    console.error("Error playing text to speech:", error);
    throw error;
  }
};
