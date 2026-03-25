import OpenAI from 'openai';
import config from './config.js';

let openai = null;
let whisperClient = null;

function getOpenAIClient() {
  if (!openai) {
    if (!config.openaiApiKey) {
      throw new Error('OPENAI_API_KEY not set in .env');
    }
    openai = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return openai;
}

function getWhisperClient() {
  if (!whisperClient) {
    const baseURL = config.whisperBaseURL || '[localhost](http://192.168.0.20:8080v1)';
    whisperClient = new OpenAI({
      baseURL,
      apiKey: 'not-needed', // El servidor local no requiere API key real
    });
  }
  return whisperClient;
}

export async function transcribe(audioBuffer, filename = 'audio.webm') {
  const client = getWhisperClient();
  const file = new File([audioBuffer], filename, { type: 'audio/webm' });

  const result = await client.audio.transcriptions.create({
    model: 'whisper-1', // El servidor local acepta cualquier nombre
    file,
  });

  return result.text;
}

// Agent → voice mapping
const AGENT_VOICES = {
  'main': 'onyx',
  'claw-1': 'echo',
  'claw-2': 'fable',
};

export async function speak(text, agentId = 'main') {
  const client = getOpenAIClient();
  const voice = AGENT_VOICES[agentId] || 'nova';

  const response = await client.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
