import { grpcClient } from "./grpcClient";

export interface StreamData {
    ts: number;
    audio: string; // base64
    video: string; // base64
}

let isStreaming = false;
let retryTimer: NodeJS.Timeout | null = null;

export const startStream = (
    onData: (data: StreamData) => void,
    onEnd?: () => void
) => {
    if (isStreaming) {
        console.warn("[gRPC] ⚠️ Stream déjà en cours, skip.");
        return;
    }

    console.log("[gRPC] 🔄 Démarrage du stream...");
    const stream = grpcClient.GetStream({ dummy: 0 });

    if (!stream) {
        console.error("[gRPC] ❌ Impossible de démarrer le flux (stream null)");
        return;
    }

    isStreaming = true;

    stream.on("data", (chunk: any) => {
        try {
            const parsed: StreamData = {
                ts: Number(chunk.ts),
                audio: Buffer.isBuffer(chunk.audio)
                    ? chunk.audio.toString("base64")
                    : "",
                video: Buffer.isBuffer(chunk.video)
                    ? chunk.video.toString("base64")
                    : "",
            };
            onData(parsed);
        } catch (err) {
            console.error("[gRPC] ❌ Erreur parsing data :", err);
        }
    });

    stream.on("error", (err: any) => {
        console.error("[gRPC] ❌ Erreur du stream :", err.message || err);
        isStreaming = false;
        if (!retryTimer) {
            console.log("[gRPC] 🔁 Reconnexion dans 3s...");
            retryTimer = setTimeout(() => {
                retryTimer = null;
                startStream(onData, onEnd);
            }, 3000);
        }
    });

    stream.on("end", () => {
        console.warn("[gRPC] 🚫 Flux terminé.");
        isStreaming = false;
        onEnd?.();

        if (!retryTimer) {
            console.log("[gRPC] 🔁 Reconnexion dans 3s...");
            retryTimer = setTimeout(() => {
                retryTimer = null;
                startStream(onData, onEnd);
            }, 3000);
        }
    });

    // En cas d’annulation côté serveur
    stream.on("cancelled", () => {
        console.warn("[gRPC] 🚫 Stream annulé par le serveur.");
        isStreaming = false;
    });
};
