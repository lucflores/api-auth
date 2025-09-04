// src/app.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { initPassportJWT } from './config/passport.js';
import sessionsRouter from './routes/api/sessions.js';
import usersRouter from './routes/api/users.js';
import productsRouter from './routes/api/products.js'; // <- NUEVO
import cartsRouter from './routes/api/carts.js';       // <- NUEVO

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || true, // ej: http://localhost:5173,http://localhost:3000
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

initPassportJWT(passport);
app.use(passport.initialize());

// Rutas
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter); // <- NUEVO
app.use('/api/carts', cartsRouter);       // <- NUEVO

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 y manejador de errores (opcional pero recomendado)
app.use((req, res) => res.status(404).json({ status: 'error', error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ status: 'error', error: err.message || 'Internal error' });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB conectado');
  app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Error conectando a MongoDB', err);
  process.exit(1);
});
