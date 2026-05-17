import { useQuery } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';
import type { AdminPatientDetail } from '../types';

export function usePatientDetail(patientId: string) {
  const api = useAdminApi();

  return useQuery({
    queryKey: ['patients', 'detail', patientId],
    queryFn: () => api.request<AdminPatientDetail>(`/admin/patients/${encodeURIComponent(patientId)}`),
    enabled: patientId.length > 0,
    staleTime: 30_000,
    gcTime: 60_000,
  });
}
