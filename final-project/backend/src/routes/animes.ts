import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const animes = await prisma.anime.findMany({
      include: {
        locations: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(animes);
  } catch (error) {
    console.error('Get animes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const anime = await prisma.anime.findUnique({
      where: { id },
      include: {
        locations: true,
      },
    });

    if (!anime) {
      res.status(404).json({ error: 'Anime not found' });
      return;
    }

    res.json(anime);
  } catch (error) {
    console.error('Get anime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


