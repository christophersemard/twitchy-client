// server.mjs
import http from "http";
import { WebSocketServer } from "ws";
import { Buffer } from "buffer";

const server = http.createServer();
const wss = new WebSocketServer({ server });
const clients = new Set();

function createMockStreamData() {
    return JSON.stringify({
        ts: Date.now(),
        audio: Buffer.from("audio test").toString("base64"),
        video: Buffer.from("video test").toString("base64"),
    });
}

function startBroadcastLoop() {
    setInterval(() => {
        const message = createMockStreamData();
        for (const client of clients) {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        }
    }, 2000);
}

function setupHeartbeat(ws) {
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

wss.on("connection", (ws) => {
    console.log("[WS] Client connecté");
    clients.add(ws);
    setupHeartbeat(ws);

    ws.on("close", () => {
        console.log("[WS] Déconnecté");
        clients.delete(ws);
    });

    ws.on("error", (err) => {
        console.error("[WS] Erreur :", err.message);
        clients.delete(ws);
    });
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur WebSocket lancé sur ws://localhost:${PORT}`);
    startBroadcastLoop();
});
