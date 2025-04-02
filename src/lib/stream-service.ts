import { twitchyClient } from './grpc-client';
import { StreamRequest, StreamDataClient  } from '../../static_codegen/twitchy_pb';
import type { WebSocket } from 'ws'; // ✅ bon type


type StreamData = {
  ts: number;
  audio: Uint8Array;
  video: Uint8Array;
};

export function startStreamingToSocket(socket: WebSocket) {
  const request = new StreamRequest();
  request.setDummy(0);

  function connect() {
    const call = twitchyClient.getStream(request);

    call.on('data', (data: StreamDataClient) => {
      const ts = data.getTs();
      const audio = data.getAudio_asU8();
      const video = data.getVideo_asU8();

      const payload: StreamData = {
        ts,
        audio,
        video,
      };

      socket.send(JSON.stringify(payload));
    });

    call.on('end', () => {
      console.log('gRPC stream ended. Reconnecting...');
      setTimeout(connect, 2000);
    });

    call.on('error', (err) => {
      console.error('gRPC stream error:', err);
      setTimeout(connect, 2000);
    });
  }

  connect();
}
