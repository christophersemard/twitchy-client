// =====================
// 📦 server.ts (Node.js)
// =====================

import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { startStream } from "./lib/startStream";
import { PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

interface StreamData {
    ts: number;
    audio: Buffer;
    video: Buffer;
}

interface AliveWebSocket extends WebSocket {
    isAlive: boolean;
    hasInitSegment?: boolean;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
const clients = new Set<AliveWebSocket>();

let ffmpegInput = new PassThrough();
let initSegment: Buffer | null = null;

function setupHeartbeat(ws: AliveWebSocket) {
    ws.isAlive = true;
    ws.on("pong", () => (ws.isAlive = true));
}

setInterval(() => {
    for (const client of clients) {
        if (!client.isAlive) {
            console.warn("[WS] 🔌 Client inactif — suppression");
            clients.delete(client);
            client.terminate();
        } else {
            client.isAlive = false;
            client.ping();
        }
    }
}, 30000);

wss.on("connection", (ws) => {
    const socket = ws as AliveWebSocket;
    console.log("[WS] ✅ Nouveau client connecté");
    socket.hasInitSegment = false;
    clients.add(socket);
    setupHeartbeat(socket);

    if (initSegment) {
        try {
            socket.send(initSegment);
            socket.hasInitSegment = true;
            console.log("[WS] 🚀 Init segment envoyé au client");
        } catch (e) {
            console.warn("[WS] ⚠️ Erreur envoi init segment:", e);
        }
    }

    ws.on("close", () => {
        console.log("[WS] ❌ Client déconnecté");
        clients.delete(socket);
    });

    ws.on("error", (err) => {
        console.error("[WS] ⚠️ Erreur client:", err.message);
        clients.delete(socket);
    });
});

function broadcast(buffer: Buffer) {
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            if (!client.hasInitSegment && initSegment) {
                client.send(initSegment);
                client.hasInitSegment = true;
            }
            client.send(buffer);
            console.log(
                "[WS] 📦 Envoi de données au client",
                buffer.length,
                "octets"
            );
        }
    }
}

function startFfmpegTranscode() {
    console.log("[FFMPEG] 🎬 Démarrage transcoding fMP4...");

    const outputFile = fs.createWriteStream("debug_output.mp4");

    const ffmpegProcess = ffmpeg(ffmpegInput)
        .inputFormat("mpegts")
        .videoCodec("libx264")
        .noAudio()
        .addOutputOption(
            "-movflags",
            "frag_keyframe+empty_moov+default_base_moof"
        )
        .addOutputOption("-preset", "ultrafast")
        .addOutputOption("-g", "25")
        .addOutputOption("-f", "mp4")
        .addOutputOption("-vsync", "1")
        .on("start", (cmd) => console.log("[FFMPEG] ▶️ Lancement :", cmd))
        .on("stderr", (line) => {
            if (line.includes("frame=")) console.log("[FFMPEG]", line);
        })
        .on("error", (err) => console.error("[FFMPEG] ❌ Erreur:", err.message))
        .on("end", () => console.log("[FFMPEG] ✅ Fin du transcoding"))
        .pipe();

    let accumulated = Buffer.alloc(0);
    let foundInit = false;

    ffmpegProcess.on("data", (chunk: Buffer) => {
        accumulated = Buffer.concat([accumulated, chunk]);

        const moovIndex = accumulated.indexOf(Buffer.from("moov"));
        const mdatIndex = accumulated.indexOf(Buffer.from("mdat"));

        if (
            !foundInit &&
            moovIndex !== -1 &&
            mdatIndex !== -1 &&
            moovIndex < mdatIndex
        ) {
            initSegment = accumulated.slice(0, mdatIndex);
            const rest = accumulated.slice(mdatIndex);
            foundInit = true;
            broadcast(initSegment);
            if (rest.length > 0) broadcast(rest);
        } else if (foundInit) {
            broadcast(chunk);
        }

        outputFile.write(chunk);
    });
}

function startStreamingOnce() {
    if (ffmpegInput.readableEnded || ffmpegInput.destroyed) {
        ffmpegInput = new PassThrough();
    }

    startFfmpegTranscode();

    startStream(
        (data: StreamData) => {
            if (Buffer.isBuffer(data.video)) ffmpegInput.write(data.video);
        },
        () => {
            console.warn("[STREAM] 🚫 Flux terminé. Reconnexion dans 3s...");
            setTimeout(startStreamingOnce, 3000);
        }
    );
}

const PORT = 4100;
server.listen(PORT, () => {
    console.log(`🚀 Serveur WebSocket prêt sur ws://localhost:${PORT}`);
    startStreamingOnce();
});
