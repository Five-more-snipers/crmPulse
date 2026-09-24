// @ts-check
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import db from './config/database.js';
import clientRoutes from './routes/clientRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import authRoutes from './routes/authRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Swagger UI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/monitoring', activityRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  try {
    // Test SQLite query
    const row = db.prepare("SELECT datetime('now') as current_time, sqlite_version() as sqlite_ver").get();
    
    res.json({
      success: true,
      status: 'ok',
      service: 'DevPulse CRM API',
      timestamp: row.current_time,
      database: {
        engine: 'SQLite 3',
        version: row.sqlite_ver,
        connected: true,
      },
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Database query failed',
      error: error.message,
    });
  }
});

// Centralized Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 DevPulse CRM Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
