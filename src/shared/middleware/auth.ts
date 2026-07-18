import { Request, Response, NextFunction } from 'express';
import { Logger } from '../infrastructure/Logger';

const logger = new Logger('AuthMiddleware');

/**
 * Mock JWT Authentication Middleware for MVP Testing.
 * In production, this would use passport.js or express-jwt to validate
 * signatures against an Identity Provider (Auth0/Okta).
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.security('Missing or invalid authorization header');
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];

  // MOCK VALIDATION: In MVP, any token that isn't 'invalid_token' is accepted.
  if (token === 'invalid_token') {
    logger.security('Attempted login with invalid token');
    return res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
  }

  // Inject a mock enterprise tenant context into the request
  // In production, this comes from the decoded JWT claims.
  req.user = {
    id: 'user_123',
    tenantId: 'tenant_enterprise_001',
    role: 'KNOWLEDGE_MANAGER',
  };

  next();
};

// Extend Express Request interface to include our injected user object
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenantId: string;
        role: string;
      };
    }
  }
}
