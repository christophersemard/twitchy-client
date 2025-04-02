import React, { useEffect, useState, useRef } from 'react';

interface StreamMessage {
  ts: number;
  audio: string;
  video: string;
}

const StreamPlayer: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [fps, setFps] = useState<number>(0);
  const [mute, setMute] = useState<boolean>(false);
  const [videoSrc, setVideoSrc] = useState<string>('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    // Connexion au WebSocket (assurez-vous que l’URL correspond à votre endpoint)
    const ws = new WebSocket('ws://localhost:3000/api/stream/socket');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connecté");
      setConnected(true);
    };

    ws.onclose = () => {
      console.log("WebSocket déconnecté");
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error("Erreur WebSocket:", error);
      setConnected(false);
    };

    ws.onmessage = async (event) => {
      try {
        // On suppose que le message est au format JSON
        const data: StreamMessage = JSON.parse(event.data);
        setTimestamp(data.ts);
        setVideoSrc(`data:image/jpeg;base64,${data.video}`);

        // Incrémentation du compteur pour le calcul du FPS
        frameCountRef.current += 1;

        // Gestion de la lecture audio (si non mute)
        if (!mute && data.audio) {
          // Création de l’AudioContext s’il n’existe pas
          if (!audioContextRef.current) {
            const AudioContextConstructor =
              window.AudioContext ||
              ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
            audioContextRef.current = new AudioContextConstructor();
          }
          const audioContext = audioContextRef.current;

          // Décodage de la chaîne base64 en ArrayBuffer
          const binaryString = window.atob(data.audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          try {
            const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
          } catch (decodeError) {
            console.error("Erreur de décodage audio", decodeError);
          }
        }
      } catch (e) {
        console.error("Erreur lors du parsing du message", e);
      }
    };

    // Nettoyage à la destruction du composant
    return () => {
      ws.close();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [mute]); // On recrée la connexion si l’état mute change (optionnel selon votre logique)

  // Calcul du FPS (nombre d’images reçues par seconde)
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMuteToggle = () => {
    setMute((prev) => !prev);
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <p><strong>Status :</strong> {connected ? "Connecté" : "Déconnecté"}</p>
        <p><strong>Timestamp :</strong> {timestamp}</p>
        <p><strong>FPS :</strong> {fps}</p>
        <button onClick={handleMuteToggle}>
          {mute ? "Activer le son" : "Mute"}
        </button>
      </div>
      <div>
        {videoSrc ? (
          <img src={videoSrc} alt="Stream vidéo" style={{ maxWidth: '100%' }} />
        ) : (
          <p>En attente du flux vidéo...</p>
        )}
      </div>
    </div>
  );
};

export default StreamPlayer;
