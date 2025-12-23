import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  data?: any;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error('Error:', err);
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(err.data && { data: err.data })
  });
};

export default errorHandler;

