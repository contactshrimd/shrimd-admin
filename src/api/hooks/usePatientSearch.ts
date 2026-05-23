import { useQuery } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';
import type { AdminPatientSummary } from '../types';

export function usePatientSearch(query: string) {
  const api = useAdminApi();

  return useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: () =>
      api.request<{ patients: AdminPatientSummary[] }>(
        `/admin/patients/search?q=${encodeURIComponent(query)}`,
      ),
    enabled: true,
    staleTime: 30_000,
    gcTime: 60_000,
  });
}
