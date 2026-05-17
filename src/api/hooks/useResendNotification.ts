import { useMutation } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';

type ResendRequest = { patientId: string; notificationType: string };
type ResendResult = { action: string; patientId: string; status: 'queued'; queuedAt: string };

export function useResendNotification() {
  const api = useAdminApi();

  return useMutation({
    mutationFn: (req: ResendRequest) =>
      api.request<ResendResult>('/admin/actions/resend-notification', {
        method: 'POST',
        body: req,
      }),
  });
}
