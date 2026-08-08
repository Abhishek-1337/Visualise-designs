import { Role } from '@prisma/client';
import prisma from '../config/database';
import { CONFIGURABLE_ROLES, PERMISSION_ACTIONS, PERMISSIONS, PermissionAction } from '../config/permissions';

export type PermissionMatrix = Record<Role, Partial<Record<PermissionAction, boolean>>>;

interface CacheEntry {
  matrix: PermissionMatrix;
  expiresAt: number;
}

// Short-lived in-memory cache so the (rare) permission check doesn't hit the DB on every
// request, while still picking up admin edits within a few seconds.
const CACHE_TTL_MS = 15_000;
const cache = new Map<string, CacheEntry>();

function buildDefaultMatrix(): PermissionMatrix {
  const matrix = {
    ADMIN: {},
    MANAGER: {},
    EMPLOYEE: {},
    CLIENT: {},
  } as PermissionMatrix;

  for (const def of PERMISSIONS) {
    for (const role of CONFIGURABLE_ROLES) {
      matrix[role][def.action] = def.defaultRoles.includes(role);
    }
  }
  return matrix;
}

export async function getEffectivePermissions(tenantId: string): Promise<PermissionMatrix> {
  const cached = cache.get(tenantId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.matrix;
  }

  const matrix = buildDefaultMatrix();
  const overrides = await prisma.rolePermission.findMany({ where: { tenantId } });
  for (const override of overrides) {
    // ADMIN is never configurable; guard against stale/manually-inserted rows.
    if (override.role === 'ADMIN') continue;
    if (!PERMISSION_ACTIONS.includes(override.action as PermissionAction)) continue;
    matrix[override.role][override.action as PermissionAction] = override.allowed;
  }

  cache.set(tenantId, { matrix, expiresAt: Date.now() + CACHE_TTL_MS });
  return matrix;
}

export function invalidatePermissionCache(tenantId: string): void {
  cache.delete(tenantId);
}

interface PermissionUser {
  role: Role;
  tenantId: string;
}

/** Whether `user` is allowed to perform `action` at all (tenant-wide, no ownership check). */
export async function can(user: PermissionUser, action: PermissionAction): Promise<boolean> {
  if (user.role === 'ADMIN') return true;
  const matrix = await getEffectivePermissions(user.tenantId);
  return !!matrix[user.role]?.[action];
}

/**
 * Combined "any" + ownership-scoped check, e.g. can the user update THIS contact:
 * either they hold the tenant-wide "*_any" action, or they hold the narrower
 * "*_own"/"*_assigned"/"*_member" action AND actually own/are assigned/are a member
 * of the specific record (`isOwnRecord`).
 */
export async function canActOnRecord(
  user: PermissionUser,
  anyAction: PermissionAction,
  ownAction: PermissionAction,
  isOwnRecord: boolean
): Promise<boolean> {
  if (user.role === 'ADMIN') return true;
  const matrix = await getEffectivePermissions(user.tenantId);
  if (matrix[user.role]?.[anyAction]) return true;
  return isOwnRecord && !!matrix[user.role]?.[ownAction];
}

export async function upsertPermissionOverrides(
  tenantId: string,
  updates: Array<{ role: Role; action: PermissionAction; allowed: boolean }>
): Promise<void> {
  const valid = updates.filter(
    (u) => u.role !== 'ADMIN' && CONFIGURABLE_ROLES.includes(u.role) && PERMISSION_ACTIONS.includes(u.action)
  );

  await prisma.$transaction(
    valid.map((u) =>
      prisma.rolePermission.upsert({
        where: { tenantId_role_action: { tenantId, role: u.role, action: u.action } },
        update: { allowed: u.allowed },
        create: { tenantId, role: u.role, action: u.action, allowed: u.allowed },
      })
    )
  );

  invalidatePermissionCache(tenantId);
}
