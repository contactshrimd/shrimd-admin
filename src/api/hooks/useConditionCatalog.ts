import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';

export type CatalogPlanInput = {
  planId: string;
  tierName: string;
  bullets: string[];
  stripePriceId: string;
  stripeCouponId: string | null;
  discountLabel: string | null;
};

export type CatalogConditionInput = {
  displayName: string;
  shortDescription: string;
  whatIsIt: string;
  whoIsItFor: string;
  iconIdentifier: string;
  sortOrder: number;
  plans: CatalogPlanInput[];
};

export type CatalogPlanView = {
  planId: string;
  tierName: string;
  bullets: string[];
  stripePriceId: string;
  priceAmountCents: number;
  priceCurrency: string;
  priceInterval: string;
  stripeCouponId: string | null;
  discountLabel: string | null;
  discountAmountOffCents: number | null;
  discountPercentOff: number | null;
};

export type StripeWarning = {
  planId: string;
  field: 'stripePriceId' | 'stripeCouponId';
  message: string;
};

export type AdminCatalogCondition = {
  conditionId: string;
  displayName: string;
  shortDescription: string;
  whatIsIt: string;
  whoIsItFor: string;
  iconIdentifier: string;
  sortOrder: number;
  plans: CatalogPlanView[];
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  stripeWarnings: StripeWarning[];
};

export function useAdminCatalog() {
  const api = useAdminApi();
  return useQuery({
    queryKey: ['adminCatalog'],
    queryFn: () => api.request<AdminCatalogCondition[]>('/admin/catalog'),
    staleTime: 30_000,
  });
}

export function useUpdateConditionCatalog() {
  const api = useAdminApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conditionId, body }: { conditionId: string; body: CatalogConditionInput }) =>
      api.request<AdminCatalogCondition>(`/admin/catalog/${conditionId}`, { method: 'PUT', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCatalog'] });
    },
  });
}
