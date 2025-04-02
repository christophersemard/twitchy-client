// package: twitchy
// file: twitchy.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class StreamData extends jspb.Message { 
    getTs(): number;
    setTs(value: number): StreamData;
    getAudio(): Uint8Array | string;
    getAudio_asU8(): Uint8Array;
    getAudio_asB64(): string;
    setAudio(value: Uint8Array | string): StreamData;
    getVideo(): Uint8Array | string;
    getVideo_asU8(): Uint8Array;
    getVideo_asB64(): string;
    setVideo(value: Uint8Array | string): StreamData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StreamData.AsObject;
    static toObject(includeInstance: boolean, msg: StreamData): StreamData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StreamData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StreamData;
    static deserializeBinaryFromReader(message: StreamData, reader: jspb.BinaryReader): StreamData;
}

export namespace StreamData {
    export type AsObject = {
        ts: number,
        audio: Uint8Array | string,
        video: Uint8Array | string,
    }
}

export class Ack extends jspb.Message { 
    getSize(): number;
    setSize(value: number): Ack;
    getError(): number;
    setError(value: number): Ack;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Ack.AsObject;
    static toObject(includeInstance: boolean, msg: Ack): Ack.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Ack, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Ack;
    static deserializeBinaryFromReader(message: Ack, reader: jspb.BinaryReader): Ack;
}

export namespace Ack {
    export type AsObject = {
        size: number,
        error: number,
    }
}

export class StreamRequest extends jspb.Message { 
    getDummy(): number;
    setDummy(value: number): StreamRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StreamRequest.AsObject;
    static toObject(includeInstance: boolean, msg: StreamRequest): StreamRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StreamRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StreamRequest;
    static deserializeBinaryFromReader(message: StreamRequest, reader: jspb.BinaryReader): StreamRequest;
}

export namespace StreamRequest {
    export type AsObject = {
        dummy: number,
    }
}

export class StreamDataClient extends jspb.Message { 
    getTs(): number;
    setTs(value: number): StreamDataClient;
    getAudio(): Uint8Array | string;
    getAudio_asU8(): Uint8Array;
    getAudio_asB64(): string;
    setAudio(value: Uint8Array | string): StreamDataClient;
    getVideo(): Uint8Array | string;
    getVideo_asU8(): Uint8Array;
    getVideo_asB64(): string;
    setVideo(value: Uint8Array | string): StreamDataClient;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): StreamDataClient.AsObject;
    static toObject(includeInstance: boolean, msg: StreamDataClient): StreamDataClient.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: StreamDataClient, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): StreamDataClient;
    static deserializeBinaryFromReader(message: StreamDataClient, reader: jspb.BinaryReader): StreamDataClient;
}

export namespace StreamDataClient {
    export type AsObject = {
        ts: number,
        audio: Uint8Array | string,
        video: Uint8Array | string,
    }
}
