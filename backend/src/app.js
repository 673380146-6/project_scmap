import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes_API/auth.routes.js';
import userRoutes from './routes_API/users.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running 🚀 with Firebase' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Error handler
app.use(errorMiddleware);

export default app;
