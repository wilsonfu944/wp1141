import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/auth';
import locationRoutes from '../src/routes/locations';
import animeRoutes from '../src/routes/animes';
import favoriteRoutes from '../src/routes/favorites';
import commentRoutes from '../src/routes/comments';
import itineraryRoutes from '../src/routes/itineraries';
import exportRoutes from '../src/routes/export';
import forumRoutes from '../src/routes/forum';
import messageRoutes from '../src/routes/messages';
import ratingRoutes from '../src/routes/ratings';
import aiRoutes from '../src/routes/ai';
import favoriteAnimeRoutes from '../src/routes/favoriteAnimes';
import friendRoutes from '../src/routes/friends';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/animes', animeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/favorite-animes', favoriteAnimeRoutes);
app.use('/api/friends', friendRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AniMap API is running' });
});

// Export for Vercel serverless
export default app;



