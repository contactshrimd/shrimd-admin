export const ADMIN_ROLES = ['support_agent', 'admin', 'clinical_ops'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminRoute = {
  id: string;
  label: string;
  backendRoute: string;
  status: 'live' | 'deferred';
  allowedRoles: AdminRole[];
  summary: string;
  detail: string;
  group?: 'config';
};

export const routes: AdminRoute[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    backendRoute: 'GET /admin/dashboard',
    status: 'deferred',
    allowedRoles: ['admin', 'clinical_ops'],
    summary: 'Operational metrics are pending backend support.',
    detail: 'The dashboard stays read-only and must not call a dashboard route until it appears in backend OpenAPI.',
  },
  {
    id: 'patient-search',
    label: 'Patient Search',
    backendRoute: 'GET /admin/patients/search',
    status: 'live',
    allowedRoles: ['support_agent', 'admin', 'clinical_ops'],
    summary: 'Find patients using role-scoped backend results.',
    detail: 'Search results must show basic information only and treat omitted optional fields as unavailable.',
  },
  {
    id: 'patient-detail',
    label: 'Patient Detail',
    backendRoute: 'GET /admin/patients/{patientId}',
    status: 'live',
    allowedRoles: ['support_agent', 'admin', 'clinical_ops'],
    summary: 'Review backend-scoped patient context.',
    detail: 'Mutating controls must call backend admin action endpoints and rely on backend audit logging.',
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    backendRoute: 'GET /admin/audit-logs',
    status: 'live',
    allowedRoles: ['admin', 'clinical_ops'],
    summary: 'Inspect backend-recorded admin activity.',
    detail: 'Support agents cannot access audit logs; audit export is restricted to admins only.',
  },
  {
    id: 'workflow-commands',
    label: 'Workflow Commands',
    backendRoute: 'GET /admin/workflow-commands',
    status: 'live',
    allowedRoles: ['admin', 'clinical_ops'],
    summary: 'Monitor redacted backend integration work.',
    detail: 'Raw command payloads must never be displayed; the backend returns payload keys only.',
  },
  {
    id: 'refill-queue',
    label: 'Refill Queue',
    backendRoute: 'GET /admin/refills',
    status: 'deferred',
    allowedRoles: ['admin', 'clinical_ops'],
    summary: 'Refill queue operations are deferred.',
    detail: 'Navigation can stay disabled until the backend exposes refill queue and review routes.',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    backendRoute: 'GET /admin/subscriptions',
    status: 'deferred',
    allowedRoles: ['admin'],
    summary: 'Subscription monitoring is deferred.',
    detail: 'Payment retry must not render as an active action until a backend route exists.',
  },
  {
    id: 'condition-flags',
    label: 'Condition Flags',
    backendRoute: 'PUT /config/conditions',
    status: 'live',
    allowedRoles: ['admin', 'clinical_ops'],
    summary: 'Control which conditions are visible in the patient app.',
    detail: 'Toggle launch flags per condition. Changes take effect immediately for new patient sessions.',
    group: 'config',
  },
  {
    id: 'condition-catalog',
    label: 'Condition Catalog',
    backendRoute: 'GET /admin/catalog, PUT /admin/catalog/:conditionId',
    status: 'live',
    allowedRoles: ['admin', 'clinical_ops'],
    summary: 'Configure condition names, plan options, bullets, Stripe prices, and discounts.',
    detail: 'Changes take effect for patients within 5 minutes. Stripe Prices and Coupons must be created in the Stripe Dashboard before linking here.',
    group: 'config',
  },
  {
    id: 'form-builder',
    label: 'Intake Form Builder',
    backendRoute: 'GET/PUT/POST /admin/forms',
    status: 'live',
    allowedRoles: ['admin', 'clinical_ops'],
    summary: 'Manage dynamic intake form drafts and published versions.',
    detail: 'Clinical ops can inspect forms and versions. Admins can save drafts and publish through backend validation.',
    group: 'config',
  },
  {
    id: 'crosssell-rules',
    label: 'Cross-Sell Rules',
    backendRoute: 'GET/POST/PUT/PATCH /admin/crosssell-rules',
    status: 'live',
    allowedRoles: ['admin', 'clinical_ops'],
    summary: 'Configure cross-sell offer rules shown to patients after intake submission.',
    detail: 'Rules trigger based on condition enrolled or intake form responses. Changes affect new intake submissions only.',
    group: 'config',
  },
];

export function getVisibleRoutes(role: AdminRole) {
  return routes.filter(route => route.allowedRoles.includes(role));
}
