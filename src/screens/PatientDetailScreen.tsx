import { useState } from 'react';
import { usePatientDetail } from '../api/hooks/usePatientDetail';
import { useResendNotification } from '../api/hooks/useResendNotification';
import { useRescindIntake, useCancelRefund } from '../api/hooks/useIntakeActions';

const NOTIFICATION_TYPES = [
  { value: 'intake_received', label: 'Intake received' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'order_shipped', label: 'Order shipped' },
  { value: 'refill_reminder', label: 'Refill reminder' },
  { value: 'payment_failed', label: 'Payment failed' },
];

function FieldValue({ label, value }: { label: string; value?: string }) {
  return (
    <div className="detail-field">
      <dt>{label}</dt>
      <dd>{value ?? <span className="unavailable">—</span>}</dd>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="detail-skeleton">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${60 + (i % 3) * 15}%` }} />
      ))}
    </div>
  );
}

type ResendPanelProps = { patientId: string };

function ResendPanel({ patientId }: ResendPanelProps) {
  const [notificationType, setNotificationType] = useState(NOTIFICATION_TYPES[0].value);
  const { mutate, isPending, isSuccess, isError, reset } = useResendNotification();

  function handleResend() {
    mutate(
      { patientId, notificationType },
      { onSuccess: () => setTimeout(reset, 4000) },
    );
  }

  return (
    <div className="action-panel">
      <h3>Resend notification</h3>
      <div className="action-row">
        <label className="field action-field">
          <span>Notification type</span>
          <select
            value={notificationType}
            onChange={e => setNotificationType(e.target.value)}
            disabled={isPending}
          >
            {NOTIFICATION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="action-button"
          onClick={handleResend}
          disabled={isPending}
        >
          {isPending ? 'Sending…' : 'Resend'}
        </button>
      </div>
      {isSuccess && (
        <p className="action-success" role="status">Notification queued successfully.</p>
      )}
      {isError && (
        <p className="action-error" role="alert">Failed to resend. Please try again.</p>
      )}
    </div>
  );
}

type RescindPanelProps = { patientId: string; intakeId: string };

function RescindPanel({ patientId, intakeId }: RescindPanelProps) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const { mutate, isPending, isSuccess, isError, error, reset } = useRescindIntake();

  function handleRescind() {
    mutate(
      { patientId, intakeId, reason: reason.trim() || undefined },
      { onSuccess: () => { setConfirmed(false); setReason(''); setTimeout(reset, 5000); } },
    );
  }

  if (isSuccess) {
    return (
      <div className="action-panel">
        <h3>Rescind intake</h3>
        <p className="action-success" role="status">Intake recalled. Patient has been notified to resubmit.</p>
      </div>
    );
  }

  return (
    <div className="action-panel">
      <h3>Rescind intake</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Returns this intake to the patient for correction. The patient will be notified and can resubmit without paying again.
      </p>
      {!confirmed ? (
        <button type="button" className="action-button" onClick={() => setConfirmed(true)}>
          Rescind intake
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="field">
            <span>Reason (optional)</span>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Patient requested correction to question 3"
              maxLength={500}
              rows={2}
              disabled={isPending}
              style={{ resize: 'vertical' }}
            />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="action-button" onClick={handleRescind} disabled={isPending}>
              {isPending ? 'Rescinding…' : 'Confirm rescind'}
            </button>
            <button type="button" className="action-button-secondary" onClick={() => setConfirmed(false)} disabled={isPending}>
              Cancel
            </button>
          </div>
          {isError && (
            <p className="action-error" role="alert">
              {(error as { message?: string })?.message ?? 'Failed to rescind. Please try again.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type CancelRefundPanelProps = { patientId: string; intakeId: string };

function CancelRefundPanel({ patientId, intakeId }: CancelRefundPanelProps) {
  const [refundType, setRefundType] = useState<'full' | 'custom'>('full');
  const [customAmount, setCustomAmount] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const { mutate, isPending, isSuccess, data, isError, error, reset } = useCancelRefund();

  function handleCancel() {
    const cents = refundType === 'full' ? -1 : Math.round(parseFloat(customAmount) * 100);
    if (refundType === 'custom' && (isNaN(cents) || cents < 0)) return;
    mutate(
      { patientId, intakeId, refundAmountCents: refundType === 'full' ? 0 : cents, reason: reason.trim() || undefined },
      { onSuccess: () => { setConfirmed(false); setTimeout(reset, 6000); } },
    );
  }

  if (isSuccess) {
    const refundCents = data?.refundAmountCents;
    return (
      <div className="action-panel">
        <h3>Cancel &amp; refund</h3>
        <p className="action-success" role="status">
          {refundCents
            ? `Refund of $${(refundCents / 100).toFixed(2)} issued. Subscription cancelled. Patient notified.`
            : 'Subscription cancelled. Patient notified.'}
        </p>
      </div>
    );
  }

  return (
    <div className="action-panel">
      <h3>Cancel &amp; refund</h3>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
        Cancels this intake and the patient's subscription. A refund will be issued to the original payment method.
      </p>
      {!confirmed ? (
        <button type="button" className="action-button action-button-danger" onClick={() => setConfirmed(true)}>
          Cancel &amp; refund…
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="field">
            <span>Refund amount</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 400 }}>
                <input type="radio" value="full" checked={refundType === 'full'} onChange={() => setRefundType('full')} />
                Full refund
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 400 }}>
                <input type="radio" value="custom" checked={refundType === 'custom'} onChange={() => setRefundType('custom')} />
                Custom amount
              </label>
              {refundType === 'custom' && (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  disabled={isPending}
                  style={{ width: 120, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 6 }}
                />
              )}
            </div>
          </label>
          <label className="field">
            <span>Reason (optional)</span>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Patient changed their mind"
              maxLength={500}
              rows={2}
              disabled={isPending}
              style={{ resize: 'vertical' }}
            />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="action-button action-button-danger" onClick={handleCancel} disabled={isPending}>
              {isPending ? 'Processing…' : 'Confirm cancel & refund'}
            </button>
            <button type="button" className="action-button-secondary" onClick={() => setConfirmed(false)} disabled={isPending}>
              Back
            </button>
          </div>
          {isError && (
            <p className="action-error" role="alert">
              {(error as { message?: string })?.message ?? 'Failed to process. Please try again.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type Props = { patientId: string; onBack: () => void };

export function PatientDetailScreen({ patientId, onBack }: Props) {
  const { data, isLoading, isError, error } = usePatientDetail(patientId);

  return (
    <div className="screen">
      <button type="button" className="back-button" onClick={onBack}>
        ← Back to results
      </button>

      {isLoading && <SkeletonDetail />}

      {isError && (
        <div className="screen-error" role="alert">
          {(error as { message?: string }).message ?? 'Failed to load patient. Please try again.'}
        </div>
      )}

      {data && (
        <>
          <div className="detail-header">
            <div>
              <h2 className="detail-name">{data.displayName ?? 'Unknown patient'}</h2>
              <code className="patient-id detail-id">{data.patientId}</code>
            </div>
            {data.state && <span className="badge">{data.state}</span>}
          </div>

          <div className="detail-sections">
            <section className="detail-card">
              <h3>Status</h3>
              <dl className="detail-grid">
                <FieldValue label="Lifecycle" value={data.lifecycleState} />
                <FieldValue label="Review" value={data.reviewStatus} />
                <FieldValue label="Subscription" value={data.subscriptionStatus} />
                <FieldValue label="Last updated" value={data.updatedAt} />
              </dl>
            </section>

            <section className="detail-card">
              <h3>Extended info</h3>
              <dl className="detail-grid">
                <FieldValue label="Email" value={data.email} />
                <FieldValue label="Refill status" value={data.refillStatus} />
                <FieldValue label="Prescription" value={data.prescriptionStatus} />
                <FieldValue label="Fulfillment" value={data.fulfillmentStatus} />
              </dl>
            </section>
          </div>

          <ResendPanel patientId={patientId} />

          {data.lifecycleState === 'review_pending' && data.currentIntakeId && (
            <>
              <RescindPanel patientId={patientId} intakeId={data.currentIntakeId} />
              <CancelRefundPanel patientId={patientId} intakeId={data.currentIntakeId} />
            </>
          )}
        </>
      )}
    </div>
  );
}
