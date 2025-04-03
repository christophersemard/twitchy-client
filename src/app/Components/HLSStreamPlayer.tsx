import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const HLSStreamPlayer = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [connected, setConnected] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:4000");

        // Log when WebSocket connects
        socket.onopen = () => {
            console.log("[WS] ✅ Connecté au WebSocket");
            setConnected(true);
        };

        // Handle WebSocket messages
        socket.onmessage = (event) => {
            const { data } = event;

            if (data instanceof Blob) {
                console.log("[WS] 📦 Données binaires reçues : ", data);

                // Handle the binary data (HLS segments or video)
                const reader = new FileReader();
                reader.onload = () => {
                    const videoData = reader.result as ArrayBuffer;

                    // If HLS.js is available
                    if (Hls.isSupported()) {
                        const hls = new Hls();
                        hls.loadSource(
                            URL.createObjectURL(new Blob([videoData]))
                        );
                        if (videoRef.current) {
                            hls.attachMedia(videoRef.current);
                            console.log(
                                "[HLS.js] 🎞️ Flux HLS attaché au lecteur."
                            );
                        }
                    } else {
                        console.log(
                            "[HLS.js] ❌ HLS.js non pris en charge par ce navigateur."
                        );
                    }
                };
                reader.readAsArrayBuffer(data);
            } else {
                try {
                    const json = JSON.parse(data);
                    console.log("[WS] 🎬 Données JSON reçues : ", json);
                } catch (err) {
                    console.error("[WS] ❌ Erreur parsing JSON : ", err);
                }
            }
        };

        // Handle WebSocket errors
        socket.onerror = (event) => {
            console.error("[WS] ⚠️ Erreur WebSocket:", event);
        };

        // Handle WebSocket closure
        socket.onclose = (event) => {
            console.log("[WS] ❌ Déconnecté du WebSocket", event);
            setConnected(false);
            setWs(null);

            // Relancer la connexion après 5 secondes
            setTimeout(() => {
                console.log("[WS] 🔄 Tentative de reconnexion...");
                setWs(new WebSocket("ws://localhost:4000"));
            }, 5000);
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, []);

    return (
        <div style={{ padding: "1rem", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ marginBottom: "1rem" }}>
                <p>
                    <strong>Status :</strong>{" "}
                    {connected ? "✅ Connecté" : "❌ Déconnecté"}
                </p>
            </div>
            <video
                ref={videoRef}
                controls
                autoPlay
                muted
                playsInline
                style={{ width: "100%", backgroundColor: "black" }}
            />
        </div>
    );
};

export default HLSStreamPlayer;
