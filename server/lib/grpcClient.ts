import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.join(__dirname, "..", "proto", "twitchy.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const grpcPackage = grpc.loadPackageDefinition(packageDefinition) as any;

export const grpcClient = new grpcPackage.twitchy.Twitchy(
    "51.38.189.96:3000",
    grpc.credentials.createInsecure()
);
