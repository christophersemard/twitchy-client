import { NextRequest } from 'next/server';
import { WebSocketServer, WebSocket as WsWebSocket } from 'ws'; // <- ici on renomme le type
import { startStreamingToSocket } from '@/lib/stream-service';

const wss = new WebSocketServer({ noServer: true });

export const config = {
  api: {
    bodyParser: false,
  },
};

export function GET(req: NextRequest) {
  const anyReq = req as any;
  const { socket } = anyReq;

  if (!socket || !socket.server) {
    return new Response('No socket', { status: 400 });
  }

  if (!socket.server.wss) {
    socket.server.wss = wss;

    wss.on('connection', (ws: WsWebSocket) => {
      console.log('WebSocket client connecté');
      startStreamingToSocket(ws); // ✅ ws est maintenant bien typé
    });
  }

  return new Response(null, { status: 101 });
}
