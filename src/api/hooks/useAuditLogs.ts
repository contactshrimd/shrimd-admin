import { useQuery } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';
import type { AuditLogSummary } from '../types';

export function useAuditLogs(patientId: string) {
  const api = useAdminApi();
  const params = patientId.trim() ? `?patientId=${encodeURIComponent(patientId.trim())}` : '';

  return useQuery({
    queryKey: ['audit-logs', patientId.trim()],
    queryFn: () =>
      api.request<{ auditLogs: AuditLogSummary[] }>(`/admin/audit-logs${params}`),
    staleTime: 30_000,
    gcTime: 60_000,
  });
}
