import type { User } from '../types/api';
import type { View } from '../components/Layout';

type NormalizedRole = 'admin' | 'operador' | 'usuario';

function normalizeRole(role?: User['role'] | null): NormalizedRole {
  if (role === 'admin') return 'admin';
  if (role === 'operator' || role === 'operador') return 'operador';
  return 'usuario';
}

export function getUserPermissions(user?: User | null) {
  const role = normalizeRole(user?.role);

  return {
    role,
    canCreateProducts: true,
    canEditProducts: role !== 'usuario',
    canDeleteProducts: role !== 'usuario',
    canCreateSuppliers: true,
    canEditSuppliers: role !== 'usuario',
    canDeleteSuppliers: role !== 'usuario',
    canManageCategories: role !== 'usuario',
    canAccessSettings: role === 'admin',
    canViewDeletedItems: true,
  };
}

export function canAccessView(view: View, user?: User | null) {
  const permissions = getUserPermissions(user);

  if (view === 'settings' || view === 'users') {
    return permissions.canAccessSettings;
  }

  if (view === 'deleted-items') {
    return permissions.canViewDeletedItems;
  }

  return true;
}
