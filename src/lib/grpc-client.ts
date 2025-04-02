import * as grpc from '@grpc/grpc-js';
import { TwitchyClient } from '../../static_codegen/twitchy_grpc_pb'; 

export const twitchyClient = new TwitchyClient(
  'localhost:50051', // adapte selon ton backend gRPC
  grpc.credentials.createInsecure()
);
