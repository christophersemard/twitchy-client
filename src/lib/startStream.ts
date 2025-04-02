import { grpcClient } from './grpcClient';

export interface StreamData {
  ts: number;
  audio: string; // base64
  video: string; // base64
}

export const startStream = (onData: (data: StreamData) => void) => {
  const stream = grpcClient.GetStream({ dummy: 0 });

  stream.on('data', (chunk: any) => {
    const parsed: StreamData = {
      ts: Number(chunk.ts),
      audio: chunk.audio.toString('base64'),
      video: chunk.video.toString('base64'),
    };
    onData(parsed);
  });

  stream.on('error', (err: any) => {
    console.error('[gRPC] ❌ Stream error:', err.message);
  });

  stream.on('end', () => {
    console.warn('[gRPC] 🚫 Stream ended');
  });
};
