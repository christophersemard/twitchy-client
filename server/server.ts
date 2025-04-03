import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { startStream } from "./lib/startStream";

interface StreamData {
    ts: number;
    audio: string;
    video: string;
}

interface AliveWebSocket extends WebSocket {
    isAlive: boolean;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
const clients = new Set<AliveWebSocket>();

// Ping/pong heartbeat
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

// Connexion WebSocket
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

// Initialisation unique du flux
let streamActive = false;

function startStreamingOnce() {
    if (streamActive) return;
    streamActive = true;

    console.log("[STREAM] Démarrage du flux gRPC");

    startStream(
        (data: StreamData) => {
            const message = JSON.stringify(data);
            let sentCount = 0;

            for (const client of clients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                    sentCount++;
                }
            }

            if (sentCount > 0) {
                console.log(
                    `[STREAM] → ${sentCount} client(s) ont reçu un message (ts=${data.ts})`
                );
            }
        },
        () => {
            console.warn(
                "[STREAM] Flux terminé. Tentative de reconnexion dans 3s..."
            );
            streamActive = false;

            setTimeout(() => {
                startStreamingOnce();
            }, 3000);
        }
    );
}

// Lancer le serveur
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur WebSocket prêt sur ws://localhost:${PORT}`);
    startStreamingOnce(); // Lance une seule fois, et redémarre si erreur
});
