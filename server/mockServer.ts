import http from "http";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";

const server = http.createServer();
const wss = new WebSocketServer({ server });

const IMAGE_PATH = path.join(__dirname, "test.webp");
const imageBuffer = fs.readFileSync(IMAGE_PATH); // Assure-toi d’avoir test.webp dans ce dossier

wss.on("connection", (ws) => {
    console.log("[WS] ✅ Client connecté (mock)");

    const interval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            console.log(imageBuffer);
            ws.send(imageBuffer);
            console.log("[MOCK] 🖼️ Image envoyée (test.webp)");
        }
    }, 1000); // 1 image/sec

    ws.on("close", () => {
        console.log("[WS] ❌ Client déconnecté (mock)");
        clearInterval(interval);
    });
});

const PORT = 4001;
server.listen(PORT, () => {
    console.log(`🚀 Serveur Mock WebSocket prêt sur ws://localhost:${PORT}`);
});
