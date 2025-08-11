import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { initPassportJWT } from './config/passport.js';
import sessionsRouter from './routes/api/sessions.js';
import usersRouter from './routes/api/users.js';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

initPassportJWT(passport);
app.use(passport.initialize());

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB conectado');
  app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Error conectando a MongoDB', err);
  process.exit(1);
});