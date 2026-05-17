import { useEffect, useRef, useState } from 'react';
import { useAuditLogs } from '../api/hooks/useAuditLogs';
import { useAuditExport } from '../api/hooks/useAuditExport';
import type { AuditLogSummary } from '../api/types';
import type { AdminRole } from '../routes';

function MetaKeys({ keys }: { keys: string[] }) {
  if (keys.length === 0) return <span className="unavailable">—</span>;
  return (
    <div className="meta-keys">
      {keys.map(k => <span key={k} className="meta-pill">{k}</span>)}
    </div>
  );
}

function AuditRow({ log }: { log: AuditLogSummary }) {
  return (
    <tr>
      <td className="ts-cell">{log.timestamp ?? <span className="unavailable">—</span>}</td>
      <td>{log.actorRole ?? <span className="unavailable">—</span>}</td>
      <td><code className="mono-cell">{log.actorId ?? '—'}</code></td>
      <td>{log.action ?? <span className="unavailable">—</span>}</td>
      <td><code className="mono-cell">{log.patientId ?? '—'}</code></td>
      <td>{log.result ?? <span className="unavailable">—</span>}</td>
      <td><code className="mono-cell corr-id">{log.correlationId ?? '—'}</code></td>
      <td><MetaKeys keys={log.metadataKeys} /></td>
    </tr>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="skeleton-row">
          {Array.from({ length: 8 }).map((__, j) => (
            <td key={j}><span className="skeleton-cell" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

type Props = { role: AdminRole };

export function AuditLogsScreen({ role }: Props) {
  const [input, setInput] = useState('');
  const [patientId, setPatientId] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPatientId(input.trim()), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input]);

  const { data, isFetching, isError, error } = useAuditLogs(patientId);
  const { mutate: runExport, isPending: exporting, isSuccess: exported, isError: exportFailed, reset: resetExport } = useAuditExport();
  const logs = data?.auditLogs ?? [];

  function handleExport() {
    runExport(undefined, { onSuccess: () => setTimeout(resetExport, 4000) });
  }

  return (
    <div className="screen">
      <div className="filter-bar">
        <input
          type="search"
          placeholder="Filter by patient ID…"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="search-input"
          aria-label="Filter audit logs by patient ID"
        />
        {isFetching && <span className="search-spinner" aria-hidden="true" />}

        {role === 'admin' && (
          <div className="export-group">
            <button
              type="button"
              className="export-button"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting…' : 'Export'}
            </button>
            {exported && <span className="action-success">Download started.</span>}
            {exportFailed && <span className="action-error">Export failed.</span>}
          </div>
        )}
      </div>

      {isError && (
        <div className="screen-error" role="alert">
          {(error as { message?: string }).message ?? 'Failed to load audit logs. Please try again.'}
        </div>
      )}

      {!isFetching && !isError && logs.length === 0 && (
        <div className="screen-empty">
          {patientId ? `No audit logs found for patient "${patientId}".` : 'No audit logs found.'}
        </div>
      )}

      {(isFetching || logs.length > 0) && (
        <div className="table-wrapper">
          <table className="data-table audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor role</th>
                <th>Actor ID</th>
                <th>Action</th>
                <th>Patient ID</th>
                <th>Result</th>
                <th>Correlation ID</th>
                <th>Metadata keys</th>
              </tr>
            </thead>
            <tbody>
              {isFetching
                ? <SkeletonRows />
                : logs.map(log => <AuditRow key={log.auditLogId} log={log} />)
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
