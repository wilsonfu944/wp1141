import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { searchPlaces, geocodeAddress } from '../services/googleMaps';

const prisma = new PrismaClient();

export const getPlaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const places = await prisma.place.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

export const getPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const place = await prisma.place.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!place) {
      const error: any = new Error('Place not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: place
    });
  } catch (error) {
    next(error);
  }
};

export const createPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { name, address, latitude, longitude, placeId, notes, category } = req.body;

    const place = await prisma.place.create({
      data: {
        name,
        address,
        latitude,
        longitude,
        placeId,
        notes,
        category,
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Place created successfully',
      data: place
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, address, latitude, longitude, notes, category } = req.body;

    // Check ownership
    const existingPlace = await prisma.place.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!existingPlace) {
      const error: any = new Error('Place not found');
      error.statusCode = 404;
      throw error;
    }

    const place = await prisma.place.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(notes !== undefined && { notes }),
        ...(category !== undefined && { category })
      }
    });

    res.json({
      success: true,
      message: 'Place updated successfully',
      data: place
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const place = await prisma.place.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!place) {
      const error: any = new Error('Place not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.place.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Place deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const searchPlacesAPI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyword, lat, lng, radius } = req.body;

    if (!keyword) {
      const error: any = new Error('Keyword is required');
      error.statusCode = 400;
      throw error;
    }

    const results = await searchPlaces(keyword, lat, lng, radius);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

export const geocodeAPI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;

    if (!address) {
      const error: any = new Error('Address is required');
      error.statusCode = 400;
      throw error;
    }

    const result = await geocodeAddress(address);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

