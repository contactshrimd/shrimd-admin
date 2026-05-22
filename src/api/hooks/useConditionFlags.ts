import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';

export const VERTICALS = [
  { id: 'testosterone',  name: "Testosterone / Men's HRT" },
  { id: 'womens_hrt',    name: "Women's HRT / Menopause" },
  { id: 'mental_health', name: 'Mental Health' },
  { id: 'migraine',      name: 'Migraine Treatment' },
  { id: 'fertility',     name: 'Fertility' },
  { id: 'thyroid',       name: 'Thyroid / Autoimmune' },
  { id: 'sleep',         name: 'Sleep' },
  { id: 'skin',          name: 'Chronic Skin / Derm' },
  { id: 'adhd',          name: 'Non-Stimulant ADHD' },
] as const;

export type VerticalId = typeof VERTICALS[number]['id'];
export type ConditionFlags = Record<VerticalId, boolean>;

export function useConditionFlags() {
  const api = useAdminApi();
  return useQuery({
    queryKey: ['conditionFlags'],
    queryFn: () => api.request<ConditionFlags>('/config/conditions'),
    staleTime: 30_000,
  });
}

export function useSetConditionFlag() {
  const api = useAdminApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flags: Partial<ConditionFlags>) =>
      api.request<ConditionFlags>('/config/conditions', { method: 'PUT', body: flags }),
    onSuccess: (data) => {
      qc.setQueryData(['conditionFlags'], data);
    },
  });
}
