import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'default-secret-change-this';

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'hotel' | 'merchant' | 'client';
  entityId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  try {
    const users = await storage.getAllUsers();
    const existingUser: any = users.find((u: any) => u.username === username);
    if (!existingUser) return null;
    const isProd = (process.env.NODE_ENV || 'development') === 'production';
    if (isProd) {
      const ok = await bcrypt.compare(password, existingUser.password);
      if (!ok) return null;
    }
    return {
      id: existingUser.id,
      username: existingUser.username,
      role: (existingUser.role as any) || 'client',
      entityId: (existingUser.entity_id as any) || (existingUser.entityId as any) || undefined,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  if (!isProd) {
    // Dev bypass
    let role: 'admin' | 'hotel' | 'merchant' | 'client' = 'admin';
    let entityId: number | undefined = undefined;
    if (req.path.includes('/hotel')) { role = 'hotel'; entityId = 1; }
    else if (req.path.includes('/merchant')) { role = 'merchant'; entityId = 1; }
    else if (req.path.includes('/admin')) { role = 'admin'; }
    else { role = 'client'; }
    req.user = { id: 1, username: `test-${role}`, role, entityId };
    return next();
  }
  // Production: require Bearer token
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid token' });
  req.user = payload;
  next();
}

export function requireRole(role: 'admin' | 'hotel' | 'merchant' | 'client') {
  return (req: Request, res: Response, next: NextFunction) => {
    const isProd = (process.env.NODE_ENV || 'development') === 'production';
    if (!isProd) {
      if (!req.user) {
        req.user = { id: 1, username: `test-${role}`, role, entityId: role === 'hotel' || role === 'merchant' ? 1 : undefined };
      }
      return next();
    }
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

export function requireEntityAccess(req: Request, res: Response, next: NextFunction) {
  const isProd = (process.env.NODE_ENV || 'development') === 'production';
  if (!isProd) return next();
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  
  // In prod: ensure hotel/merchant endpoints accessed by matching entity
  const isHotelEndpoint = req.path.includes('/hotel/') || req.path.includes('/stats/hotel/') || req.path.includes('/orders/hotel/');
  const isMerchantEndpoint = req.path.includes('/merchant/') || req.path.includes('/stats/merchant/') || req.path.includes('/orders/merchant/');
  
  if (isHotelEndpoint) {
    if (req.user.role !== 'hotel' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Hotel access required' });
    }
  }
  
  if (isMerchantEndpoint) {
    if (req.user.role !== 'merchant' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Merchant access required' });
    }
  }
  
  next();
} 