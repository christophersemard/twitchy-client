"use client";

import { useEffect } from "react";
import {
    startWebSocket,
    onWebSocketData,
    stopWebSocket,
} from "@/lib/websocket";

export default function WebSocketViewer() {
    useEffect(() => {
        startWebSocket();

        onWebSocketData((data) => {
            console.log("📥 Donnée reçue", data);
            // décoder et afficher le flux ici
        });

        return () => stopWebSocket();
    }, []);

    return <div>🎥 En attente de flux...</div>;
}
