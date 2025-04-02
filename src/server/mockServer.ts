import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '..', 'proto', 'twitchy.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcPackage = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server();

server.addService(grpcPackage.twitchy.Twitchy.service, {
  GetStream: (_call: any) => {
    let ts = Date.now();
    const interval = setInterval(() => {
      const audioBuffer = Buffer.from('test audio');
      const videoBuffer = Buffer.from('test video');

      _call.write({
        ts,
        audio: audioBuffer,
        video: videoBuffer,
      });

      ts += 1000;
    }, 500);

    _call.on('cancelled', () => {
      console.log('[SERVER] Client cancelled stream.');
      clearInterval(interval);
    });

    _call.on('error', (err: any) => {
      console.error('[SERVER] Stream error:', err);
      clearInterval(interval);
    });

    _call.on('end', () => {
      console.log('[SERVER] Client ended stream.');
      clearInterval(interval);
      _call.end();
    });
  }
});

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`[SERVER] Mock gRPC server started on port ${PORT}`);
  server.start();
});
