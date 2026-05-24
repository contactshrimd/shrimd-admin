import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';
import type {
  AdminFormConfigView,
  FormConfigSummary,
  FormVersionDetail,
  FormVersionSummary,
  MigrateFormsResult,
  PublishFormInput,
  SaveFormDraftInput,
} from '../types';

export function useFormList() {
  const api = useAdminApi();

  return useQuery({
    queryKey: ['forms'],
    queryFn: () => api.request<{ forms: FormConfigSummary[] }>('/admin/forms'),
    staleTime: 30_000,
    gcTime: 60_000,
  });
}

export function useFormConfig(conditionId?: string) {
  const api = useAdminApi();

  return useQuery({
    queryKey: ['forms', conditionId],
    queryFn: () => api.request<AdminFormConfigView>(`/admin/forms/${conditionId}`),
    enabled: Boolean(conditionId),
    staleTime: 15_000,
    gcTime: 60_000,
  });
}

export function useFormVersions(conditionId?: string) {
  const api = useAdminApi();

  return useQuery({
    queryKey: ['forms', conditionId, 'versions'],
    queryFn: () =>
      api.request<{ versions: FormVersionSummary[] }>(`/admin/forms/${conditionId}/versions`),
    enabled: Boolean(conditionId),
    staleTime: 30_000,
    gcTime: 60_000,
  });
}

export function useFormVersionDetail(conditionId?: string, version?: number) {
  const api = useAdminApi();

  return useQuery({
    queryKey: ['forms', conditionId, 'versions', version],
    queryFn: () =>
      api.request<FormVersionDetail>(`/admin/forms/${conditionId}/versions/${version}`),
    enabled: Boolean(conditionId && version),
    staleTime: 60_000,
    gcTime: 120_000,
  });
}

export function useSaveDraft() {
  const api = useAdminApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId, questions }: SaveFormDraftInput) =>
      api.request<AdminFormConfigView>(`/admin/forms/${conditionId}/draft`, {
        method: 'PUT',
        body: { questions },
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['forms'] });
      qc.setQueryData(['forms', data.conditionId], data);
    },
  });
}

export function usePublishForm() {
  const api = useAdminApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId, expectedUpdatedAt, clinicalReview }: PublishFormInput) =>
      api.request<AdminFormConfigView>(`/admin/forms/${conditionId}/publish`, {
        method: 'POST',
        body: { expectedUpdatedAt, clinicalReview },
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['forms'] });
      qc.invalidateQueries({ queryKey: ['forms', data.conditionId, 'versions'] });
      qc.setQueryData(['forms', data.conditionId], data);
    },
  });
}

export function useMigrateForms() {
  const api = useAdminApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.request<MigrateFormsResult>('/admin/forms/migrate', {
        method: 'POST',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forms'] });
    },
  });
}
