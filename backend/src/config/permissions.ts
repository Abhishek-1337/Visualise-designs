import { Role } from '@prisma/client';

/**
 * Central catalog of fine-grained permission actions.
 *
 * How it's used:
 *  - Every action has a set of roles that are allowed to perform it by default.
 *  - A tenant ADMIN can override the default for MANAGER / EMPLOYEE / CLIENT via
 *    the RolePermission table (see permission.service.ts). ADMIN itself is never
 *    overridable and always passes every check, to avoid self-lockout.
 *  - "_any" actions grant access to every matching record tenant-wide.
 *    "_own" / "_assigned" / "_member" actions grant access only when the acting
 *    user is the owner / assignee / a project member of that specific record.
 *    A role passes a check if it holds the "_any" action OR the narrower one
 *    AND the ownership condition is true.
 *  - CLIENT's restriction to their own linked Contact's data is a hard tenant/
 *    data-isolation boundary (prevents one client from seeing another client's
 *    data within the same tenant) and is enforced directly in the controllers,
 *    not through this configurable matrix.
 */

export type PermissionAction =
  | 'contact.view_all'
  | 'contact.create'
  | 'contact.update_any'
  | 'contact.update_own'
  | 'contact.delete_any'
  | 'contact.delete_own'
  | 'deal.create'
  | 'deal.update_any'
  | 'deal.update_assigned'
  | 'deal.delete_any'
  | 'project.create'
  | 'project.update_any'
  | 'project.update_member'
  | 'project.delete_any'
  | 'task.create'
  | 'task.update_any'
  | 'task.update_assigned'
  | 'task.delete_any'
  | 'file.upload'
  | 'file.delete_any'
  | 'file.delete_own'
  | 'data.seed'
  | 'data.reseed';

export interface PermissionDefinition {
  action: PermissionAction;
  category: string;
  label: string;
  description: string;
  /** Roles allowed to perform this action out of the box (ADMIN is implicit and omitted here). */
  defaultRoles: Role[];
}

const ROLE = { MANAGER: 'MANAGER', EMPLOYEE: 'EMPLOYEE', CLIENT: 'CLIENT' } as const;

export const PERMISSIONS: PermissionDefinition[] = [
  // Contacts
  { action: 'contact.view_all', category: 'Contacts', label: 'View all contacts', description: 'See every contact in the tenant, not just ones owned by the user.', defaultRoles: [ROLE.MANAGER] },
  { action: 'contact.create', category: 'Contacts', label: 'Create contacts', description: 'Add new contacts.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },
  { action: 'contact.update_any', category: 'Contacts', label: 'Edit any contact', description: 'Edit contacts regardless of owner.', defaultRoles: [ROLE.MANAGER] },
  { action: 'contact.update_own', category: 'Contacts', label: 'Edit owned contacts', description: 'Edit contacts the user owns.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },
  { action: 'contact.delete_any', category: 'Contacts', label: 'Delete any contact', description: 'Archive/delete contacts regardless of owner.', defaultRoles: [ROLE.MANAGER] },
  { action: 'contact.delete_own', category: 'Contacts', label: 'Delete owned contacts', description: 'Archive/delete contacts the user owns.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },

  // Deals
  { action: 'deal.create', category: 'Deals', label: 'Create deals', description: 'Add new deals.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },
  { action: 'deal.update_any', category: 'Deals', label: 'Edit any deal', description: 'Edit deals regardless of assignment.', defaultRoles: [ROLE.MANAGER] },
  { action: 'deal.update_assigned', category: 'Deals', label: 'Edit assigned deals', description: 'Edit deals assigned to the user.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },
  { action: 'deal.delete_any', category: 'Deals', label: 'Delete deals', description: 'Delete/convert deals regardless of assignment.', defaultRoles: [ROLE.MANAGER] },

  // Projects
  { action: 'project.create', category: 'Projects', label: 'Create projects', description: 'Add new projects.', defaultRoles: [ROLE.MANAGER] },
  { action: 'project.update_any', category: 'Projects', label: 'Edit any project', description: 'Edit projects regardless of membership.', defaultRoles: [ROLE.MANAGER] },
  { action: 'project.update_member', category: 'Projects', label: 'Edit member projects', description: 'Edit projects the user is a member of.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },
  { action: 'project.delete_any', category: 'Projects', label: 'Delete projects', description: 'Delete projects.', defaultRoles: [ROLE.MANAGER] },

  // Tasks
  { action: 'task.create', category: 'Tasks', label: 'Create tasks', description: 'Add new tasks.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },
  { action: 'task.update_any', category: 'Tasks', label: 'Edit any task', description: 'Edit tasks regardless of assignment.', defaultRoles: [ROLE.MANAGER] },
  { action: 'task.update_assigned', category: 'Tasks', label: 'Edit assigned tasks', description: 'Edit tasks assigned to the user.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },
  { action: 'task.delete_any', category: 'Tasks', label: 'Delete tasks', description: 'Delete tasks regardless of assignment.', defaultRoles: [ROLE.MANAGER] },

  // Files
  { action: 'file.upload', category: 'Files', label: 'Upload files', description: 'Attach files to contacts/projects.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },
  { action: 'file.delete_any', category: 'Files', label: 'Delete any file', description: 'Delete files regardless of uploader.', defaultRoles: [ROLE.MANAGER] },
  { action: 'file.delete_own', category: 'Files', label: 'Delete own uploads', description: 'Delete files the user uploaded.', defaultRoles: [ROLE.MANAGER, ROLE.EMPLOYEE] },

  // Data
  { action: 'data.seed', category: 'Data', label: 'Seed demo data', description: 'Generate demo data for an empty tenant.', defaultRoles: [ROLE.MANAGER] },
  { action: 'data.reseed', category: 'Data', label: 'Wipe & reseed data', description: 'Destructively wipe and regenerate ALL tenant CRM data. Defaults to admin-only.', defaultRoles: [] },
];

export const PERMISSION_ACTIONS: PermissionAction[] = PERMISSIONS.map((p) => p.action);

export const CONFIGURABLE_ROLES: Role[] = ['MANAGER', 'EMPLOYEE', 'CLIENT'];
