import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import locationRoutes from './routes/locations';
import animeRoutes from './routes/animes';
import favoriteRoutes from './routes/favorites';
import commentRoutes from './routes/comments';
import itineraryRoutes from './routes/itineraries';
import exportRoutes from './routes/export';
import forumRoutes from './routes/forum';
import messageRoutes from './routes/messages';
import ratingRoutes from './routes/ratings';
import aiRoutes from './routes/ai';
import favoriteAnimeRoutes from './routes/favoriteAnimes';
import friendRoutes from './routes/friends';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

