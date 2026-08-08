import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { PermissionAction } from '../config/permissions';
import { can } from '../services/permission.service';

/** Route guard for simple, non-ownership-scoped actions (e.g. "can this role reseed data at all"). */
export const requirePermission = (action: PermissionAction) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const allowed = await can(authReq.user, action);
      if (!allowed) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({ error: 'Failed to verify permissions' });
    }
  };
};
