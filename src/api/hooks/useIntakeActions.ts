import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminApi } from '../useAdminApi';

type RescindInput = { patientId: string; intakeId: string; reason?: string };
type CancelRefundInput = { patientId: string; intakeId: string; refundAmountCents: number; reason?: string };

type IntakeActionResult = {
  patientId: string;
  intakeId: string;
  action: 'rescinded' | 'cancelled';
  refundId?: string;
  refundAmountCents?: number;
  lifecycleState: string;
  updatedAt: string;
};

export function useRescindIntake() {
  const api = useAdminApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, intakeId, reason }: RescindInput) =>
      api.request<IntakeActionResult>(
        `/admin/patients/${patientId}/intakes/${intakeId}/rescind`,
        { method: 'POST', body: { reason } }
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['patient', vars.patientId] });
    },
  });
}

export function useCancelRefund() {
  const api = useAdminApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, intakeId, refundAmountCents, reason }: CancelRefundInput) =>
      api.request<IntakeActionResult>(
        `/admin/patients/${patientId}/intakes/${intakeId}/cancel-refund`,
        { method: 'POST', body: { refundAmountCents, reason } }
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['patient', vars.patientId] });
    },
  });
}
