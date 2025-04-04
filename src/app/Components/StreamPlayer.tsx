"use client";

import { useEffect, useRef, useState } from "react";

const StreamPlayer = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [connected, setConnected] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const bufferQueue = useRef<Uint8Array[]>([]);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);

    const logEvent = (msg: string) => {
        console.log(msg);
        setLog((prev) => [msg, ...prev.slice(0, 100)]);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) {
            logEvent("[VIDEO] ❌ Élément <video> introuvable");
            return;
        }

        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        video.src = URL.createObjectURL(mediaSource);
        logEvent("[MEDIA] 🎬 MediaSource initialisé");

        mediaSource.addEventListener("sourceopen", () => {
            logEvent("[MEDIA] ✅ MediaSource ouvert");

            const mime = 'video/mp4; codecs="avc1.42E01E"'; // Constrained Baseline Profile (H.264)
            if (!MediaSource.isTypeSupported(mime)) {
                logEvent(`[MEDIA] ❌ Codec non supporté : ${mime}`);
                return;
            }

            try {
                const sourceBuffer = mediaSource.addSourceBuffer(mime);
                sourceBufferRef.current = sourceBuffer;
                sourceBuffer.timestampOffset = 0;
                logEvent(
                    "[MEDIA] ✅ SourceBuffer ajouté avec timestampOffset=0"
                );

                sourceBuffer.addEventListener("updateend", () => {
                    logEvent(
                        "[MEDIA] ✅ updateend — tentative prochain buffer"
                    );
                    pushNextBuffer();
                });
            } catch (err) {
                logEvent(
                    "[MEDIA] ❌ Erreur ajout SourceBuffer : " + String(err)
                );
                return;
            }

            const ws = new WebSocket("ws://localhost:4100");
            ws.binaryType = "arraybuffer";

            ws.onopen = () => {
                logEvent("[WS] ✅ WebSocket connecté");
                setConnected(true);
            };

            ws.onclose = () => {
                logEvent("[WS] ❌ WebSocket déconnecté");
                setConnected(false);
            };

            ws.onerror = (err) => {
                logEvent("[WS] ⚠️ Erreur WebSocket : " + String(err));
            };

            ws.onmessage = (event) => {
                const chunk = new Uint8Array(event.data);
                logEvent(`[WS] 📦 Chunk reçu (${chunk.length})`);

                bufferQueue.current.push(chunk);
                pushNextBuffer();
            };
        });

        const pushNextBuffer = () => {
            const video = videoRef.current;
            const mediaSource = mediaSourceRef.current;
            const sourceBuffer = sourceBufferRef.current;

            if (
                !sourceBuffer ||
                !mediaSource ||
                mediaSource.readyState !== "open" ||
                sourceBuffer.updating ||
                bufferQueue.current.length === 0
            ) {
                return;
            }

            const chunk = bufferQueue.current.shift();
            if (!chunk) return;

            try {
                sourceBuffer.appendBuffer(chunk);
                logEvent(`[MEDIA] 🎞️ Chunk ajouté (${chunk.length})`);

                // Afficher l'état du buffer
                const buffered = video?.buffered;
                if (buffered && buffered.length > 0) {
                    const start = buffered.start(0).toFixed(2);
                    const end = buffered.end(0).toFixed(2);
                    logEvent(`[VIDEO] ⏳ Buffer : ${start}s → ${end}s`);
                }

                // Essayer de jouer
                video?.play().catch((err) => {
                    logEvent("[VIDEO] ⚠️ Erreur play() : " + String(err));
                });
            } catch (err) {
                logEvent("[MEDIA] ❌ Erreur appendBuffer : " + String(err));
            }
        };

        video?.addEventListener("error", () => {
            const error = video.error;
            if (error) {
                logEvent(
                    `[VIDEO] ❌ Erreur code=${error.code} msg=${error.message}`
                );
                try {
                    sourceBufferRef.current?.abort();
                    mediaSourceRef.current?.endOfStream();
                    logEvent("[MEDIA] 💥 Fin forcée du stream suite à erreur");
                } catch (e) {
                    logEvent("[MEDIA] ⚠️ endOfStream échoué : " + String(e));
                }
            }
        });

        return () => {
            const mediaSource = mediaSourceRef.current;
            if (mediaSource && mediaSource.readyState === "open") {
                try {
                    mediaSource.endOfStream();
                    logEvent("[MEDIA] 🔚 endOfStream appelé proprement");
                } catch (err) {
                    logEvent(
                        "[MEDIA] ⚠️ Erreur lors du endOfStream : " + String(err)
                    );
                }
            }
        };
    }, []);

    return (
        <div style={{ padding: "1rem" }}>
            <p>Status : {connected ? "✅ Connecté" : "❌ Déconnecté"}</p>
            <video
                ref={videoRef}
                controls
                autoPlay
                muted
                playsInline
                style={{ width: "100%", backgroundColor: "black" }}
            />
            <div
                style={{
                    background: "#111",
                    color: "#0f0",
                    fontFamily: "monospace",
                    marginTop: "1rem",
                    padding: "1rem",
                    maxHeight: "300px",
                    overflow: "auto",
                    fontSize: "0.8rem",
                    border: "1px solid #444",
                }}
            >
                {log.map((line, idx) => (
                    <div key={idx}>{line}</div>
                ))}
            </div>
        </div>
    );
};

export default StreamPlayer;
