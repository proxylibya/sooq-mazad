/**
 * Extended Next.js types for Socket.IO integration
 * أنواع Next.js الموسعة لتكامل Socket.IO
 */

import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './socket';

// Extended Next.js server with Socket.IO
export interface SocketServer extends NetServer {
  io?: SocketIOServer<ServerToClientEvents, ClientToServerEvents, Record<string, never>, SocketData>;
}

// Extended Socket with Socket.IO server
export interface SocketWithIO extends Socket {
  server: SocketServer;
}

// Extended Next.js API Response with Socket.IO
export interface NextApiResponseServerIO<T = unknown> extends NextApiResponse<T> {
  socket: SocketWithIO;
}
