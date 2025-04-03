import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { startStream } from "./lib/startStream";
import ffmpeg from "fluent-ffmpeg";
import stream from "stream";
import { PassThrough } from "stream";

interface StreamData {
    ts: number;
    audio: Buffer;
    video: Buffer;
}

interface AliveWebSocket extends WebSocket {
    isAlive: boolean;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
const clients = new Set<AliveWebSocket>();

// 🩺 Ping/pong heartbeat
function setupHeartbeat(ws: AliveWebSocket) {
    ws.isAlive = true;
    ws.on("pong", () => {
        ws.isAlive = true;
    });
}

setInterval(() => {
    for (const client of clients) {
        if (!client.isAlive) {
            console.warn("[WS] Client inactif détecté — suppression");
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
    console.log("[WS] ✅ Client connecté");
    clients.add(socket);
    setupHeartbeat(socket);

    ws.on("close", () => {
        console.log("[WS] ❌ Client déconnecté");
        clients.delete(socket);
    });

    ws.on("error", (err) => {
        console.error("[WS] ⚠️ Erreur client :", err.message);
        clients.delete(socket);
    });
});

// 📦 Buffer circulaire MPEG-TS
const tsBufferChunks: Buffer[] = [];
const MAX_TOTAL_SIZE = 500 * 1024; // 500 Ko

function appendToCircularBuffer(chunk: Buffer) {
    tsBufferChunks.push(chunk);

    // Supprime les plus anciens si trop gros
    while (getTotalSize() > MAX_TOTAL_SIZE) {
        tsBufferChunks.shift();
    }
}

function getTotalSize(): number {
    return tsBufferChunks.reduce((acc, buf) => acc + buf.length, 0);
}

// 🎞️ Conversion MPEG-TS → WebP (1 frame)
function convertToWebP(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const inputStream = new PassThrough();
        inputStream.end(buffer);

        const outputChunks: Buffer[] = [];

        ffmpeg(inputStream)
            .inputFormat("mpegts")
            .noAudio()
            .outputFormat("webp")
            .outputOptions("-frames:v", "1")
            .on("error", (err) => {
                console.error(
                    "[CONVERT] ❌ Erreur conversion WebP :",
                    err.message
                );
                reject(err);
            })
            .on("end", () => {
                console.log("[CONVERT] ✅ Image WebP générée");
                resolve(Buffer.concat(outputChunks));
            })
            .pipe()
            .on("data", (chunk: Buffer) => {
                outputChunks.push(chunk);
            });
    });
}

// 🚀 Initialisation du flux gRPC
let streamActive = false;

function startStreamingOnce() {
    if (streamActive) return;
    streamActive = true;

    console.log("[STREAM] Démarrage du flux gRPC");

    startStream(
        async (data: StreamData) => {
            appendToCircularBuffer(data.video);

            try {
                const bufferToConvert = Buffer.concat(tsBufferChunks);
                const webpBuffer = await convertToWebP(bufferToConvert);

                for (const client of clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(webpBuffer);
                    }
                }
            } catch (err) {
                console.warn(
                    "[STREAM] ❌ Échec conversion frame :",
                    (err as Error).message
                );
            }
        },
        () => {
            console.warn("[STREAM] 🚫 Flux terminé. Reconnexion dans 3s.");
            streamActive = false;

            setTimeout(() => {
                startStreamingOnce();
            }, 3000);
        }
    );
}

// 🟢 Lancer le serveur
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur WebSocket prêt sur ws://localhost:${PORT}`);
    startStreamingOnce();
});
