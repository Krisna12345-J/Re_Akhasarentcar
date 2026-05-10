import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Akses Ditolak', 
    message: 'Hanya administrator yang dapat mengakses halaman ini.' 
  });
};
