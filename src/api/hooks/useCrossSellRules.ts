import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';

export type CrossSellRuleView = {
  ruleId: string;
  name: string;
  enabled: boolean;
  triggerType: 'condition' | 'response';
  sourceConditionIds: string[];
  questionKey: string | null;
  matchValues: string[];
  targetConditionId: string;
  benefitStatement: string;
  createdBy: string;
  createdAt: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
};

export type CrossSellRuleInput = {
  name: string;
  triggerType: 'condition' | 'response';
  sourceConditionIds: string[];
  questionKey: string | null;
  matchValues: string[];
  targetConditionId: string;
  benefitStatement: string;
};

export function useCrossSellRules() {
  const api = useAdminApi();
  return useQuery({
    queryKey: ['crossSellRules'],
    queryFn: () =>
      api
        .request<{ rules: CrossSellRuleView[] }>('/admin/crosssell-rules')
        .then((r) => r.rules),
    staleTime: 30_000,
  });
}

export function useCreateCrossSellRule() {
  const api = useAdminApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossSellRuleInput) =>
      api.request<{ ruleId: string }>('/admin/crosssell-rules', { method: 'POST', body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crossSellRules'] });
    },
  });
}

export function useUpdateCrossSellRule() {
  const api = useAdminApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, ...input }: { ruleId: string } & CrossSellRuleInput) =>
      api.request<{ ruleId: string }>(`/admin/crosssell-rules/${ruleId}`, {
        method: 'PUT',
        body: input,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crossSellRules'] });
    },
  });
}

export function useSetCrossSellRuleEnabled() {
  const api = useAdminApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) =>
      api.request<{ ruleId: string; enabled: boolean }>(
        `/admin/crosssell-rules/${ruleId}/enabled`,
        { method: 'PATCH', body: { enabled } }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crossSellRules'] });
    },
  });
}
