import { useState } from 'react';
import { usePatientDetail } from '../api/hooks/usePatientDetail';
import { useResendNotification } from '../api/hooks/useResendNotification';

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

          <div className="deferred-actions">
            <h3>Other actions</h3>
            <div className="deferred-action-list">
              <div className="deferred-action">
                <span>Trigger refill review</span>
                <span className="badge badge-unavailable">Coming soon</span>
              </div>
              <div className="deferred-action">
                <span>Flag issue</span>
                <span className="badge badge-unavailable">Coming soon</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
