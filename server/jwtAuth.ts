import { Request, Response, NextFunction } from 'express';
import { apiService } from './apiService';
import type { ExternalUser, JWTTokens } from '@shared/authTypes';

// Extend Express Request to include JWT user
declare global {
  namespace Express {
    interface Request {
      jwtUser?: ExternalUser;
      jwtTokens?: JWTTokens;
    }
  }
}

// JWT Authentication Middleware
export const jwtAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No JWT token, continue without setting jwtUser
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Set the token in API service
    apiService.setAccessToken(token);
    
    // Try to get user info from external API
    try {
      const response = await apiService.getMe();
      
      if (response.success && response.data) {
        req.jwtUser = response.data;
        req.jwtTokens = { accessToken: token, refreshToken: '' }; // We only have access token here
      }
    } catch (error) {
      // Token might be expired or invalid, clear it
      apiService.setAccessToken(null);
      console.log('JWT token validation failed:', error);
    }
    
    next();
  } catch (error) {
    console.error('JWT auth middleware error:', error);
    next();
  }
};

// Helper function to check if request has valid JWT authentication
export const isJWTAuthenticated = (req: Request): boolean => {
  return !!req.jwtUser;
};

// Combined authentication check (JWT or Replit Auth)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check JWT auth first
  if (isJWTAuthenticated(req)) {
    return next();
  }
  
  // Check demo session auth
  if ((req.session as any)?.demoUser) {
    return next();
  }
  
  // Check Replit auth
  if ((req as any).isAuthenticated && (req as any).isAuthenticated() && (req as any).user?.claims?.sub) {
    return next();
  }
  
  return res.status(401).json({ message: "Authentication required" });
};

// Get current user from any auth method
export const getCurrentUser = async (req: Request): Promise<any> => {
  // JWT user
  if (req.jwtUser) {
    return {
      id: req.jwtUser.id,
      email: req.jwtUser.email,
      firstName: req.jwtUser.fullname?.split(' ')[0] || '',
      lastName: req.jwtUser.fullname?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: '',
      balance: req.jwtUser.balance?.toString() || "0",
      isAdmin: req.jwtUser.isAdmin || false,
      createdAt: req.jwtUser.createdAt ? new Date(req.jwtUser.createdAt) : new Date(),
      updatedAt: req.jwtUser.updatedAt ? new Date(req.jwtUser.updatedAt) : new Date(),
    };
  }
  
  // Demo user
  if ((req.session as any)?.demoUser) {
    const demoUser = (req.session as any).demoUser;
    return {
      id: demoUser.id,
      email: demoUser.email,
      firstName: demoUser.firstName,
      lastName: demoUser.lastName,
      profileImageUrl: demoUser.profileImageUrl,
      balance: demoUser.balance,
      isAdmin: demoUser.isAdmin,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  // Replit Auth user - would need storage lookup
  if ((req as any).user?.claims?.sub) {
    // This would require storage lookup, keeping original implementation
    return null; // Return null to indicate we need storage lookup
  }
  
  return null;
};