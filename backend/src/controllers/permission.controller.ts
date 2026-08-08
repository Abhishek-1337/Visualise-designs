import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { CONFIGURABLE_ROLES, PERMISSIONS, PermissionAction } from '../config/permissions';
import { getEffectivePermissions, upsertPermissionOverrides } from '../services/permission.service';

/**
 * GET /permissions
 * Returns the action catalog plus the tenant's effective role -> action matrix
 * (defaults merged with any admin overrides), so the UI can render checkboxes.
 */
export const getPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const matrix = await getEffectivePermissions(authReq.user.tenantId);

    res.json({
      roles: CONFIGURABLE_ROLES,
      catalog: PERMISSIONS,
      matrix,
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

/**
 * PUT /permissions
 * body: { updates: [{ role, action, allowed }, ...] }
 * ADMIN-only (enforced at the route level). Silently ignores any attempt to
 * touch the ADMIN role or an unknown action.
 */
export const updatePermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const updates = req.body?.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ error: 'updates must be a non-empty array' });
      return;
    }

    const knownActions = new Set(PERMISSIONS.map((p) => p.action));
    const sanitized: Array<{ role: Role; action: PermissionAction; allowed: boolean }> = [];
    for (const u of updates) {
      if (
        u &&
        CONFIGURABLE_ROLES.includes(u.role) &&
        knownActions.has(u.action) &&
        typeof u.allowed === 'boolean'
      ) {
        sanitized.push({ role: u.role, action: u.action as PermissionAction, allowed: u.allowed });
      }
    }

    if (sanitized.length === 0) {
      res.status(400).json({ error: 'No valid permission updates provided' });
      return;
    }

    await upsertPermissionOverrides(authReq.user.tenantId, sanitized);
    const matrix = await getEffectivePermissions(authReq.user.tenantId);
    res.json({ matrix });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
};
