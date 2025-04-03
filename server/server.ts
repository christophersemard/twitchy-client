// server.ts
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { startStream } from "./lib/startStream";

// Interface des messages à envoyer
interface StreamData {
    ts: number;
    audio: string;
    video: string;
}

// Ajout manuel de propriété isAlive
interface AliveWebSocket extends WebSocket {
    isAlive: boolean;
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
const clients = new Set<AliveWebSocket>();

// Mock fallback (utile si pas de stream encore dispo)
function createMockStreamData(): StreamData {
    return {
        ts: Date.now(),
        audio: Buffer.from("audio test").toString("base64"),
        video: Buffer.from("video test").toString("base64"),
    };
}

// Diffusion régulière (peut être désactivée si startStream envoie déjà)
function startBroadcastLoop() {
    setInterval(() => {
        const message = JSON.stringify(createMockStreamData());
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }, 2000);
}

// Ping/pong pour éviter les connexions mortes
function setupHeartbeat(ws: AliveWebSocket) {
    ws.isAlive = true;
    ws.on("pong", () => {
        ws.isAlive = true;
    });
}

setInterval(() => {
    for (const client of clients) {
        if (!client.isAlive) {
            console.log("[WS] Client inactif terminé");
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
    console.log("[WS] Client connecté");
    clients.add(socket);
    setupHeartbeat(socket);

    // Branche la lib gRPC ici
    startStream((data: StreamData) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        } else {
            console.log("[WS] Client déconnecté, message non envoyé");
        }
    });

    ws.on("close", () => {
        console.log("[WS] Déconnecté");
        clients.delete(socket);
    });

    ws.on("error", (err) => {
        console.error("[WS] Erreur :", err.message);
        clients.delete(socket);
    });
});

// Démarrage
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur WebSocket lancé sur ws://localhost:${PORT}`);
    // startBroadcastLoop(); ← désactive si startStream fonctionne
});
