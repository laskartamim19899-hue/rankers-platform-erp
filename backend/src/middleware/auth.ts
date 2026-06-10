import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    console.log(`[AUTH] Checking ${req.method} ${req.url} for user ${user?.role}. Required: ${roles}`);
    if (!user || !roles.includes(user.role)) {
      console.warn(`[AUTH] Access Denied for ${user?.role} on ${req.method} ${req.url}`);
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
};
