import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';
import type { AdminCatalogCondition } from './useConditionCatalog';

export type ConditionFlags = Record<string, boolean>;

export function useConditionFlags() {
  const api = useAdminApi();
  return useQuery({
    queryKey: ['conditionFlags'],
    queryFn: () => api.request<ConditionFlags>('/config/conditions'),
    staleTime: 30_000,
  });
}

export function useAdminCatalogForFlags() {
  const api = useAdminApi();
  return useQuery({
    queryKey: ['adminCatalog'],
    queryFn: () => api.request<AdminCatalogCondition[]>('/admin/catalog'),
    staleTime: 30_000,
  });
}

export function useSetConditionFlag() {
  const api = useAdminApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conditionId, enabled }: { conditionId: string; enabled: boolean }) =>
      api.request<ConditionFlags>('/config/conditions', { method: 'PUT', body: { [conditionId]: enabled } }),
    onSuccess: (data) => {
      qc.setQueryData(['conditionFlags'], data);
    },
  });
}
