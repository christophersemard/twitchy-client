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

export const grpcClient = new grpcPackage.twitchy.Twitchy(
  'localhost:50051',
  grpc.credentials.createInsecure()
);
