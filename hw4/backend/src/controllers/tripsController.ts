import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { getDirections } from '../services/googleMaps';

const prisma = new PrismaClient();

export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        _count: {
          select: { days: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    next(error);
  }
};

export const getTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { id: parseInt(id), userId },
      include: {
        days: {
          include: {
            place: true
          },
          orderBy: [
            { date: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { name, startDate, endDate, description } = req.body;

    const trip = await prisma.trip.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, startDate, endDate, description } = req.body;

    // Check ownership
    const existingTrip = await prisma.trip.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!existingTrip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      throw error;
    }

    const trip = await prisma.trip.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(description !== undefined && { description })
      }
    });

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check ownership
    const trip = await prisma.trip.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.trip.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addPlaceToTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id: tripId } = req.params;
    const { placeId, date, order, notes, startTime } = req.body;

    // Check trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: parseInt(tripId), userId }
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      throw error;
    }

    // Check place ownership
    const place = await prisma.place.findFirst({
      where: { id: placeId, userId }
    });

    if (!place) {
      const error: any = new Error('Place not found');
      error.statusCode = 404;
      throw error;
    }

    const tripDay = await prisma.tripDay.create({
      data: {
        tripId: parseInt(tripId),
        date: new Date(date),
        order: order || 0,
        placeId,
        notes,
        startTime
      },
      include: {
        place: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Place added to trip successfully',
      data: tripDay
    });
  } catch (error) {
    next(error);
  }
};

export const updateTripDay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id: tripId, dayId } = req.params;
    const { order, notes, startTime, endTime } = req.body;

    // Check trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: parseInt(tripId), userId }
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      throw error;
    }

    // Check tripDay exists
    const tripDay = await prisma.tripDay.findFirst({
      where: { id: parseInt(dayId), tripId: parseInt(tripId) }
    });

    if (!tripDay) {
      const error: any = new Error('Trip day not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedTripDay = await prisma.tripDay.update({
      where: { id: parseInt(dayId) },
      data: {
        ...(order !== undefined && { order }),
        ...(notes !== undefined && { notes }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime })
      },
      include: {
        place: true
      }
    });

    res.json({
      success: true,
      message: 'Trip day updated successfully',
      data: updatedTripDay
    });
  } catch (error) {
    next(error);
  }
};

export const removePlaceFromTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id: tripId, dayId } = req.params;

    // Check trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: parseInt(tripId), userId }
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      throw error;
    }

    // Check tripDay exists
    const tripDay = await prisma.tripDay.findFirst({
      where: { id: parseInt(dayId), tripId: parseInt(tripId) }
    });

    if (!tripDay) {
      const error: any = new Error('Trip day not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.tripDay.delete({
      where: { id: parseInt(dayId) }
    });

    res.json({
      success: true,
      message: 'Place removed from trip successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getDirectionsAPI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { date } = req.query;

    // Check trip ownership
    const trip = await prisma.trip.findFirst({
      where: { id: parseInt(id), userId },
      include: {
        days: {
          where: date ? { date: new Date(date as string) } : undefined,
          include: {
            place: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!trip) {
      const error: any = new Error('Trip not found');
      error.statusCode = 404;
      throw error;
    }

    if (!trip.days || trip.days.length < 2) {
      const error: any = new Error('Not enough places to calculate directions');
      error.statusCode = 400;
      throw error;
    }

    // Calculate directions between consecutive places
    const directions = [];
    for (let i = 0; i < trip.days.length - 1; i++) {
      const origin = trip.days[i].place;
      const destination = trip.days[i + 1].place;
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destStr = `${destination.latitude},${destination.longitude}`;
      
      const result = await getDirections(originStr, destStr);
      directions.push(result);
    }

    res.json({
      success: true,
      data: directions
    });
  } catch (error) {
    next(error);
  }
};

