import express from 'express';
import cors from 'cors';
import logger from './middleware/logger.js';

// Import routes one by one
import authRoutes from './routes/authRoutes.js';
// console.log('✓ authRoutes loaded:', typeof authRoutes);

import userRoutes from './routes/userRoutes.js';
// console.log('✓ userRoutes loaded:', typeof userRoutes);
import sessionRoutes from "./routes/sessionRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Auth API Running' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/sessions", sessionRoutes);


export default app;
