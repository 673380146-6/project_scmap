import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// routes
import userRoutes from './routes_API/users.routes.js';

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

export default app;
