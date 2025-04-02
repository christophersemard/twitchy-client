import { NextRequest, NextResponse } from "next/server";
import { TwitchyClient } from "@/grpc/twitchy_grpc_pb"; // chemin à adapter
import { StreamRequest } from "@/grpc/twitchy_pb"; // chemin à adapter
import grpc from "@grpc/grpc-js";

export async function GET(req: NextRequest) {
    const client = new TwitchyClient(
        "localhost:5000",
        grpc.credentials.createInsecure()
    );

    const call = client.getStream(new StreamRequest());

    // Ici tu récupéreras les chunks de StreamDataClient
    // Exemple minimal à adapter :

    call.on("data", (chunk) => {
        console.log("🎥 Données reçues :", chunk);
    });

    call.on("end", () => {
        console.log("📴 Fin du stream");
    });

    return NextResponse.json({ status: "ok" });
}
