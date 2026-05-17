import { useMemo, useState } from 'react';
import { ADMIN_ROLES, AdminRole, getVisibleRoutes, routes } from './routes';

const roleLabels: Record<AdminRole, string> = {
  support_agent: 'Support Agent',
  admin: 'Admin',
  clinical_ops: 'Clinical Ops',
};

export function App() {
  const [role, setRole] = useState<AdminRole>('admin');
  const visibleRoutes = useMemo(() => getVisibleRoutes(role), [role]);
  const [activeRouteId, setActiveRouteId] = useState(visibleRoutes[0]?.id ?? 'patient-search');
  const activeRoute = routes.find(route => route.id === activeRouteId) ?? visibleRoutes[0];

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">ShriMD</p>
          <h1>Admin Portal</h1>
        </div>

        <label className="field">
          <span>Role Preview</span>
          <select
            value={role}
            onChange={event => {
              const nextRole = event.target.value as AdminRole;
              const nextVisibleRoutes = getVisibleRoutes(nextRole);
              setRole(nextRole);
              setActiveRouteId(nextVisibleRoutes[0]?.id ?? 'patient-search');
            }}
          >
            {ADMIN_ROLES.map(adminRole => (
              <option key={adminRole} value={adminRole}>
                {roleLabels[adminRole]}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="Admin sections">
          {visibleRoutes.map(route => (
            <button
              className={route.id === activeRoute?.id ? 'nav-item active' : 'nav-item'}
              key={route.id}
              onClick={() => setActiveRouteId(route.id)}
              type="button"
            >
              <span>{route.label}</span>
              {route.status === 'deferred' ? <small>Deferred</small> : null}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{roleLabels[role]}</p>
            <h2>{activeRoute?.label}</h2>
          </div>
          <div className="status-pill">{activeRoute?.status === 'live' ? 'Backend route' : 'Deferred'}</div>
        </header>

        {activeRoute ? (
          <section className="panel">
            <div>
              <h3>{activeRoute.summary}</h3>
              <p>{activeRoute.detail}</p>
            </div>
            <dl className="facts">
              <div>
                <dt>Backend</dt>
                <dd>{activeRoute.backendRoute}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>{activeRoute.allowedRoles.map(allowedRole => roleLabels[allowedRole]).join(', ')}</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>{activeRoute.status === 'live' ? 'Available after Firebase sign-in' : 'No network calls yet'}</dd>
              </div>
            </dl>
          </section>
        ) : (
          <section className="panel">
            <h3>No available routes</h3>
            <p>This role does not have admin portal routes configured.</p>
          </section>
        )}
      </section>
    </main>
  );
}
