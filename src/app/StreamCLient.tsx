'use client';

import { useEffect, useRef } from 'react';

export default function StreamClient() {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3000/api/stream');

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Stream data:', data);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  return <div>Streaming en cours... (voir console)</div>;
}
