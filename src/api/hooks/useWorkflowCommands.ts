import { useQuery } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';
import type { WorkflowCommandSummary } from '../types';

type Filters = { status: string; patientId: string; type: string };

export function useWorkflowCommands(filters: Filters) {
  const api = useAdminApi();

  const params = new URLSearchParams();
  if (filters.status.trim()) params.set('status', filters.status.trim());
  if (filters.patientId.trim()) params.set('patientId', filters.patientId.trim());
  if (filters.type.trim()) params.set('type', filters.type.trim());
  const qs = params.toString() ? `?${params.toString()}` : '';

  return useQuery({
    queryKey: ['workflow-commands', filters.status, filters.patientId, filters.type],
    queryFn: () =>
      api.request<{ workflowCommands: WorkflowCommandSummary[] }>(`/admin/workflow-commands${qs}`),
    staleTime: 30_000,
    gcTime: 60_000,
  });
}
