import { useMemo, useState } from 'react';
import { useAuth } from './auth/useAuth';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { SignInPage } from './auth/SignInPage';
import { ADMIN_ROLES, AdminRole, getVisibleRoutes, routes } from './routes';
import { PatientSearchScreen } from './screens/PatientSearchScreen';

const roleLabels: Record<AdminRole, string> = {
  support_agent: 'Support Agent',
  admin: 'Admin',
  clinical_ops: 'Clinical Ops',
};

function AdminShell() {
  const { user, role, signOutUser } = useAuth();
  const visibleRoutes = useMemo(() => getVisibleRoutes(role ?? ADMIN_ROLES[0]), [role]);
  const [activeRouteId, setActiveRouteId] = useState(visibleRoutes[0]?.id ?? 'patient-search');
  const activeRoute = routes.find(r => r.id === activeRouteId) ?? visibleRoutes[0];

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">ShriMD</p>
          <h1>Admin Portal</h1>
        </div>

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
            <p className="eyebrow">{role ? roleLabels[role] : ''}</p>
            <h2>{activeRoute?.label}</h2>
          </div>
          <div className="topbar-right">
            <span className="status-pill">{activeRoute?.status === 'live' ? 'Backend route' : 'Deferred'}</span>
            <div className="user-menu">
              <span className="user-email">{user?.email}</span>
              <button type="button" className="sign-out-button" onClick={signOutUser}>
                Sign out
              </button>
            </div>
          </div>
        </header>

        {activeRoute?.id === 'patient-search' ? (
          <PatientSearchScreen />
        ) : activeRoute ? (
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
                <dd>{activeRoute.allowedRoles.map(r => roleLabels[r]).join(', ')}</dd>
              </div>
              <div>
                <dt>Mode</dt>
                <dd>{activeRoute.status === 'deferred' ? 'Coming soon' : 'Live'}</dd>
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

export function App() {
  const { user, loading, accessDenied } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <SignInPage accessDenied={accessDenied} />;
  }

  return (
    <ProtectedRoute>
      <AdminShell />
    </ProtectedRoute>
  );
}
