import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const animeId = searchParams.get('animeId');
    const region = searchParams.get('region');

    const where: any = {};

    if (animeId) {
      where.animeId = animeId;
    }

    // 簡單的地區篩選
    if (region) {
      const regionBounds: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
        tokyo: { latMin: 35.5, latMax: 35.8, lngMin: 139.5, lngMax: 139.9 },
        kyoto: { latMin: 34.9, latMax: 35.1, lngMin: 135.6, lngMax: 135.8 },
        osaka: { latMin: 34.5, latMax: 34.8, lngMin: 135.4, lngMax: 135.6 },
      };

      const bounds = regionBounds[region];
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

    return NextResponse.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

