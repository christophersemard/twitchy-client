// package: twitchy
// file: twitchy.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as twitchy_pb from "./twitchy_pb";

interface ITwitchyService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    sendStream: ITwitchyService_ISendStream;
    getStream: ITwitchyService_IGetStream;
}

interface ITwitchyService_ISendStream extends grpc.MethodDefinition<twitchy_pb.StreamData, twitchy_pb.Ack> {
    path: "/twitchy.Twitchy/SendStream";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<twitchy_pb.StreamData>;
    requestDeserialize: grpc.deserialize<twitchy_pb.StreamData>;
    responseSerialize: grpc.serialize<twitchy_pb.Ack>;
    responseDeserialize: grpc.deserialize<twitchy_pb.Ack>;
}
interface ITwitchyService_IGetStream extends grpc.MethodDefinition<twitchy_pb.StreamRequest, twitchy_pb.StreamDataClient> {
    path: "/twitchy.Twitchy/GetStream";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<twitchy_pb.StreamRequest>;
    requestDeserialize: grpc.deserialize<twitchy_pb.StreamRequest>;
    responseSerialize: grpc.serialize<twitchy_pb.StreamDataClient>;
    responseDeserialize: grpc.deserialize<twitchy_pb.StreamDataClient>;
}

export const TwitchyService: ITwitchyService;

export interface ITwitchyServer extends grpc.UntypedServiceImplementation {
    sendStream: grpc.handleBidiStreamingCall<twitchy_pb.StreamData, twitchy_pb.Ack>;
    getStream: grpc.handleServerStreamingCall<twitchy_pb.StreamRequest, twitchy_pb.StreamDataClient>;
}

export interface ITwitchyClient {
    sendStream(): grpc.ClientDuplexStream<twitchy_pb.StreamData, twitchy_pb.Ack>;
    sendStream(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<twitchy_pb.StreamData, twitchy_pb.Ack>;
    sendStream(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<twitchy_pb.StreamData, twitchy_pb.Ack>;
    getStream(request: twitchy_pb.StreamRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<twitchy_pb.StreamDataClient>;
    getStream(request: twitchy_pb.StreamRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<twitchy_pb.StreamDataClient>;
}

export class TwitchyClient extends grpc.Client implements ITwitchyClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public sendStream(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<twitchy_pb.StreamData, twitchy_pb.Ack>;
    public sendStream(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<twitchy_pb.StreamData, twitchy_pb.Ack>;
    public getStream(request: twitchy_pb.StreamRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<twitchy_pb.StreamDataClient>;
    public getStream(request: twitchy_pb.StreamRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<twitchy_pb.StreamDataClient>;
}
