"use client";

import { useEffect, useRef, useState } from "react";

const TestFrameImage = () => {
    const [connected, setConnected] = useState(false);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const lastImageRef = useRef<number>(0);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:4000");
        ws.binaryType = "blob";

        ws.onopen = () => {
            console.log("[WS] ✅ Connecté");
            setConnected(true);
        };

        ws.onclose = () => {
            console.log("[WS] ❌ Déconnecté");
            setConnected(false);
        };

        ws.onerror = (err) => {
            console.error("[WS] ⚠️ Erreur WebSocket:", err);
        };

        ws.onmessage = (event) => {
            const blob = event.data as Blob;
            console.log("[WS] 📦 Données binaires reçues :", blob);
            console.log("[WS] 📦 Image reçue :", blob);
            console.log("[WS] 📦 Image type :", blob.type);

            if (!(blob instanceof Blob)) {
                console.warn("[WS] ⚠️ Donnée inattendue (non-Blob)");
                return;
            }

            const now = Date.now();
            if (now - lastImageRef.current > 100) {
                // toutes les 500ms
                const url = URL.createObjectURL(blob);
                setImgSrc(url);
                lastImageRef.current = now;
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div style={{ padding: "1rem" }}>
            <p>Status : {connected ? "✅ Connecté" : "❌ Déconnecté"}</p>
            {imgSrc ? (
                <img
                    src={imgSrc}
                    alt="Frame"
                    style={{ maxWidth: "100%", border: "1px solid #ccc" }}
                />
            ) : (
                <p>Aucune image reçue pour l’instant.</p>
            )}
        </div>
    );
};

export default TestFrameImage;
