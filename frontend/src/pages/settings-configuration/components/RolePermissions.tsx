import React, { useEffect, useMemo, useState } from 'react';
import { permissionService } from '../../../services';
import Icon from '../../../components/AppIcon';

const ROLE_LABELS = {
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CLIENT: 'Client',
};

const RolePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    permissionService
      .getAll()
      .then((res) => {
        setRoles(res.data.roles || []);
        setCatalog(res.data.catalog || []);
        setMatrix(res.data.matrix || {});
      })
      .catch(() => setError('Failed to load permissions'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map();
    catalog.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category).push(item);
    });
    return Array.from(map.entries());
  }, [catalog]);

  const toggle = async (role, action, current) => {
    const key = `${role}:${action}`;
    const next = !current;
    setMatrix((prev) => ({ ...prev, [role]: { ...prev[role], [action]: next } }));
    setSavingKey(key);
    setError('');
    try {
      const res = await permissionService.update([{ role, action, allowed: next }]);
      setMatrix(res.data.matrix || matrix);
    } catch {
      // revert on failure
      setMatrix((prev) => ({ ...prev, [role]: { ...prev[role], [action]: current } }));
      setError('Failed to update permission. Please try again.');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-semibold text-lg text-foreground">Roles & Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Fine-tune what Manager, Employee, and Client roles can do. Admin always has full access.
        </p>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      <div className="space-y-6">
        {categories.map(([category, items]) => (
          <div key={category} className="bg-card border border-border rounded-xl shadow-soft-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h4 className="text-sm font-medium text-foreground">{category}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="px-4 py-2 font-medium">Action</th>
                    {roles.map((role) => (
                      <th key={role} className="px-4 py-2 font-medium text-center">
                        {ROLE_LABELS[role] || role}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.action} className="border-t border-border">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </td>
                      {roles.map((role) => {
                        const allowed = !!matrix?.[role]?.[item.action];
                        const key = `${role}:${item.action}`;
                        const isSaving = savingKey === key;
                        return (
                          <td key={role} className="px-4 py-3 text-center">
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => toggle(role, item.action, allowed)}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-smooth disabled:opacity-50 ${
                                allowed
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'bg-background border-border text-transparent hover:border-primary/40'
                              }`}
                              aria-label={`${allowed ? 'Revoke' : 'Grant'} ${item.label} for ${ROLE_LABELS[role] || role}`}
                            >
                              {isSaving ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Icon name="Check" size={14} color="currentColor" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolePermissions;
