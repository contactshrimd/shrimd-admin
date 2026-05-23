import { useQuery } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';

export type StripePriceView = {
  id: string;
  amountCents: number;
  currency: string;
  interval: string;
  productId: string;
  productName: string;
};

export type StripeCouponView = {
  id: string;
  name: string;
  amountOffCents: number | null;
  percentOff: number | null;
  currency: string | null;
  valid: boolean;
};

export function useStripePrices() {
  const api = useAdminApi();
  return useQuery({
    queryKey: ['stripePrices'],
    queryFn: () => api.request<{ prices: StripePriceView[] }>('/admin/stripe/prices'),
    staleTime: 60_000,
  });
}

export function useStripeCoupons() {
  const api = useAdminApi();
  return useQuery({
    queryKey: ['stripeCoupons'],
    queryFn: () => api.request<{ coupons: StripeCouponView[] }>('/admin/stripe/coupons'),
    staleTime: 60_000,
  });
}
