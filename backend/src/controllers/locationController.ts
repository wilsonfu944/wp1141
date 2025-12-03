import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export async function getAllLocations(req: Request, res: Response): Promise<void> {
  try {
    const { animeId, region } = req.query;

    const where: any = {};

    if (animeId) {
      where.animeId = animeId as string;
    }

    // 簡單的地區篩選（可以根據座標範圍擴展）
    if (region) {
      // 這裡可以根據地區名稱設定座標範圍
      // 例如：東京大致範圍
      const regionBounds: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
        tokyo: { latMin: 35.5, latMax: 35.8, lngMin: 139.5, lngMax: 139.9 },
        kyoto: { latMin: 34.9, latMax: 35.1, lngMin: 135.6, lngMax: 135.8 },
        osaka: { latMin: 34.5, latMax: 34.8, lngMin: 135.4, lngMax: 135.6 },
      };

      const bounds = regionBounds[region as string];
      if (bounds) {
        where.latitude = { gte: bounds.latMin, lte: bounds.latMax };
        where.longitude = { gte: bounds.lngMin, lte: bounds.lngMax };
      }
    }

    const locations = await prisma.location.findMany({
      where,
      include: {
        anime: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getLocationById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        anime: {
          select: {
            id: true,
            name: true,
            nameEn: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    res.json(location);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

