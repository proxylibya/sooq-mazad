/**
 * سوق مزاد - API Server
 * Express + Socket.IO
 */

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { initializeSocketIO } from './socket-handler';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

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

// Start server
const PORT = process.env.PORT || 3020;
httpServer.listen(PORT, () => {
    console.log(`🚀 API Server running on port ${PORT}`);
});

export { app, io };
