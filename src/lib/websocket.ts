// lib/websocketClient.ts

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const listeners: ((data: Uint8Array) => void)[] = [];

function connectWebSocket() {
    socket = new WebSocket("ws://localhost:3003"); // tu peux changer ce port si besoin
    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
        console.log("✅ WebSocket connecté");
        reconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
        const data = new Uint8Array(event.data);
        listeners.forEach((fn) => fn(data));
    };

    socket.onclose = () => {
        console.warn("❌ WebSocket déconnecté");
        socket = null;
        if (reconnectAttempts < maxReconnectAttempts) {
            const delay = 1000 * 2 ** reconnectAttempts;
            reconnectAttempts++;
            console.log(`⌛ Tentative de reconnexion dans ${delay / 1000}s`);
            setTimeout(connectWebSocket, delay);
        } else {
            console.error("⛔ Trop de tentatives de reconnexion");
        }
    };

    socket.onerror = (err) => {
        console.error("Erreur WebSocket :", err);
        socket?.close();
    };
}

export function startWebSocket() {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        connectWebSocket();
    }
}

export function onWebSocketData(cb: (data: Uint8Array) => void) {
    listeners.push(cb);
}

export function stopWebSocket() {
    socket?.close();
    socket = null;
}
