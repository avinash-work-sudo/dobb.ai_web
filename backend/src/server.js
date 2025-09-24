import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WebSocketServer } from 'ws';
import http from 'http';

// Route imports
import automationRoutes from './routes/automation.js';
import testResultsRoutes from './routes/testResults.js';
import artifactsRoutes from './routes/artifacts.js';

// Database setup
import { initDatabase } from './database/init.js';

// Load environment variables
dotenv.config();

// Override with mock configuration for Midscene if not in production
if (process.env.NODE_ENV !== 'production') {
  process.env.MIDSCENE_MODEL_PROVIDER = process.env.MIDSCENE_MODEL_PROVIDER || 'mock';
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'mock-key-for-testing';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Required for browser automation
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for artifacts
app.use('/artifacts', express.static(join(__dirname, '../artifacts')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/automation', automationRoutes);
app.use('/api/test-results', testResultsRoutes);
app.use('/api/artifacts', artifactsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Initialize database
await initDatabase();

// Create HTTP server
const server = http.createServer(app);

// WebSocket setup for real-time updates
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected:', req.socket.remoteAddress);
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('WebSocket message:', message);
      
      // Handle different message types
      switch (message.type) {
        case 'subscribe_to_automation':
          ws.automationId = message.automationId;
          break;
        default:
          ws.send(JSON.stringify({ error: 'Unknown message type' }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Broadcast automation updates to WebSocket clients
export function broadcastAutomationUpdate(automationId, update) {
  wss.clients.forEach(client => {
    if (client.automationId === automationId && client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'automation_update',
        automationId,
        ...update
      }));
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Frontend CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`🤖 Midscene Provider: ${process.env.MIDSCENE_MODEL_PROVIDER || 'Not configured'}`);
  console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`🌐 API   : ${process.env.OPENAI_API_BASE || 'Default (OpenAI)'}`);
  console.log(`🧠 Model: ${process.env.OPENAI_MODEL || 'Default'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, wss };
