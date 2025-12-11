/**
 * سوق مزاد - API Server
 * Express + Socket.IO
 */

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3021', 'http://localhost:3022'],
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api', (req, res) => {
    res.json({ message: 'سوق مزاد API', version: '1.0.0' });
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.API_PORT || 3020;
httpServer.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});

export { app, io };
