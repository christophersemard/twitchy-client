import { useEffect, useRef, useState } from "react";

const WebMStreamPlayer = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const [connected, setConnected] = useState(false);
    const [fps, setFps] = useState(0);
    const frameCount = useRef(0);
    const queue: Uint8Array[] = [];
    const [thumbnail, setThumbnail] = useState<string | null>(null); // Ajout de l'état pour l'image de prévisualisation

    useEffect(() => {
        if (!window.MediaSource || !videoRef.current) {
            console.error("MediaSource non supporté ou vidéo non trouvée");
            return;
        }

        const mediaSource = new MediaSource();
        videoRef.current.src = URL.createObjectURL(mediaSource);
        mediaSourceRef.current = mediaSource;

        // Fonction pour créer un nouveau SourceBuffer
        const createSourceBuffer = () => {
            const mime = 'video/webm; codecs="vp8, vorbis"';
            if (!MediaSource.isTypeSupported(mime)) {
                console.error("Type non supporté:", mime);
                return;
            }

            const sourceBuffer = mediaSource.addSourceBuffer(mime);
            sourceBufferRef.current = sourceBuffer;

            sourceBuffer.addEventListener("updateend", () => {
                if (queue.length && !sourceBuffer.updating) {
                    const next = queue.shift();
                    if (next) {
                        try {
                            console.log(
                                "[VIDEO] 🎞️ appendBuffer direct",
                                next.length,
                                "octets"
                            );
                            if (
                                sourceBuffer &&
                                mediaSource.readyState === "open" &&
                                !sourceBuffer.updating
                            ) {
                                sourceBuffer.appendBuffer(next);
                            } else {
                                console.error(
                                    "[VIDEO] ❌ Le SourceBuffer ou le MediaSource n'est plus valide."
                                );
                            }
                        } catch (err) {
                            console.error(
                                "[VIDEO] ❌ appendBuffer échoué:",
                                err
                            );
                        }
                    }
                }
            });
        };

        mediaSource.addEventListener("sourceopen", () => {
            createSourceBuffer();

            const ws = new WebSocket("ws://localhost:4000");
            ws.binaryType = "arraybuffer";

            ws.onopen = () => {
                console.log("[WS] ✅ Connecté");
                setConnected(true);
            };

            ws.onclose = () => {
                console.log("[WS] ❌ Déconnecté");
                setConnected(false);
            };

            ws.onmessage = (event) => {
                const buffer = event.data as ArrayBuffer;
                const view = new DataView(buffer);

                const ts = view.getBigUint64(0, true);
                const videoData = new Uint8Array(buffer.slice(8)); // Suppose 8 bytes pour timestamp

                console.log(
                    "[VIDEO] 🎬 Données vidéo reçues:",
                    videoData.length
                );

                // Vérification de la validité du flux vidéo avant l'ajout
                if (sourceBufferRef.current?.updating || queue.length > 0) {
                    queue.push(videoData); // Si le buffer est en train de traiter des données, on les met dans la file d'attente
                } else {
                    try {
                        console.log(
                            "[VIDEO] 🎞️ appendBuffer direct (",
                            videoData.length,
                            "octets)"
                        );
                        if (
                            sourceBufferRef.current &&
                            mediaSource.readyState === "open" &&
                            !sourceBufferRef.current.updating
                        ) {
                            sourceBufferRef.current.appendBuffer(videoData);
                        } else {
                            console.error(
                                "[VIDEO] ❌ Le SourceBuffer ou le MediaSource n'est plus valide."
                            );
                        }
                    } catch (err) {
                        console.error("[VIDEO] ❌ appendBuffer échoué:", err);
                    }

                    // Si les données contiennent un segment d'image, tu peux l'extraire pour afficher la preview
                    if (!thumbnail) {
                        const blob = new Blob([videoData], {
                            type: "image/webp",
                        });
                        const url = URL.createObjectURL(blob);
                        setThumbnail(url); // Mettre à jour l'image de prévisualisation
                    }
                }

                frameCount.current++;
            };

            const interval = setInterval(() => {
                setFps(frameCount.current);
                frameCount.current = 0;
            }, 1000);

            return () => {
                ws.close();
                clearInterval(interval);

                // Avant de fermer, vérifier l'état de MediaSource
                const mediaSource = mediaSourceRef.current;
                if (mediaSource && mediaSource.readyState === "open") {
                    try {
                        console.log(
                            "[VIDEO] Tentative de fermeture du MediaSource."
                        );
                        mediaSource.endOfStream();
                    } catch (err) {
                        console.error(
                            "[VIDEO] ❌ Échec de la fermeture du MediaSource:",
                            err
                        );
                    }
                }
            };
        });

        return () => {
            // Lors du démontage, vérifier l'état avant de fermer
            const mediaSource = mediaSourceRef.current;
            if (mediaSource && mediaSource.readyState === "open") {
                try {
                    console.log(
                        "[VIDEO] Tentative de fermeture du MediaSource (démontage)."
                    );
                    mediaSource.endOfStream();
                } catch (err) {
                    console.error(
                        "[VIDEO] ❌ Échec de la fermeture du MediaSource (démontage):",
                        err
                    );
                }
            }
        };
    }, [thumbnail]);

    return (
        <div style={{ padding: "1rem", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ marginBottom: "1rem" }}>
                <p>
                    <strong>Status :</strong>{" "}
                    {connected ? "✅ Connecté" : "❌ Déconnecté"}
                </p>
                <p>
                    <strong>FPS :</strong> {fps}
                </p>
            </div>

            {/* Affichage de l'image de prévisualisation avant la vidéo */}
            {thumbnail ? (
                <img src={thumbnail} alt="Preview" style={{ width: "100%" }} />
            ) : (
                <video
                    ref={videoRef}
                    controls
                    autoPlay
                    muted
                    playsInline
                    style={{ width: "100%", backgroundColor: "black" }}
                />
            )}
        </div>
    );
};

export default WebMStreamPlayer;
