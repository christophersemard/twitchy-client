// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var twitchy_pb = require('./twitchy_pb.js');

function serialize_twitchy_Ack(arg) {
  if (!(arg instanceof twitchy_pb.Ack)) {
    throw new Error('Expected argument of type twitchy.Ack');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_twitchy_Ack(buffer_arg) {
  return twitchy_pb.Ack.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_twitchy_StreamData(arg) {
  if (!(arg instanceof twitchy_pb.StreamData)) {
    throw new Error('Expected argument of type twitchy.StreamData');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_twitchy_StreamData(buffer_arg) {
  return twitchy_pb.StreamData.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_twitchy_StreamDataClient(arg) {
  if (!(arg instanceof twitchy_pb.StreamDataClient)) {
    throw new Error('Expected argument of type twitchy.StreamDataClient');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_twitchy_StreamDataClient(buffer_arg) {
  return twitchy_pb.StreamDataClient.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_twitchy_StreamRequest(arg) {
  if (!(arg instanceof twitchy_pb.StreamRequest)) {
    throw new Error('Expected argument of type twitchy.StreamRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_twitchy_StreamRequest(buffer_arg) {
  return twitchy_pb.StreamRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var TwitchyService = exports.TwitchyService = {
  sendStream: {
    path: '/twitchy.Twitchy/SendStream',
    requestStream: true,
    responseStream: true,
    requestType: twitchy_pb.StreamData,
    responseType: twitchy_pb.Ack,
    requestSerialize: serialize_twitchy_StreamData,
    requestDeserialize: deserialize_twitchy_StreamData,
    responseSerialize: serialize_twitchy_Ack,
    responseDeserialize: deserialize_twitchy_Ack,
  },
  getStream: {
    path: '/twitchy.Twitchy/GetStream',
    requestStream: false,
    responseStream: true,
    requestType: twitchy_pb.StreamRequest,
    responseType: twitchy_pb.StreamDataClient,
    requestSerialize: serialize_twitchy_StreamRequest,
    requestDeserialize: deserialize_twitchy_StreamRequest,
    responseSerialize: serialize_twitchy_StreamDataClient,
    responseDeserialize: deserialize_twitchy_StreamDataClient,
  },
};

exports.TwitchyClient = grpc.makeGenericClientConstructor(TwitchyService, 'Twitchy');
