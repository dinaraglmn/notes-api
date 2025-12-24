import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Кастомный класс ошибки
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware для обработки ошибок
export const errorHandler = (
  err: Error | ZodError | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Ошибки валидации Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Наши кастомные ошибки
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Неизвестные ошибки
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};