import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// routes
import userRoutes from './routes_API/users.routes.js';
import authRoutes from './routes_API/auth.router.js';

// middleware (error handler)
import { errorHandler } from './middlewares/errorHandler.js';
import verifyFirebaseToken from './middlewares/firebase-auth.middleware.js';

const app = express();

// middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running 🚀' });
});

// api routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

// error handler (ไว้ล่างสุด)
app.use(errorHandler);

export default app;
