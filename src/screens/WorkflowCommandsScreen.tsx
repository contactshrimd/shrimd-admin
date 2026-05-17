import { useEffect, useRef, useState } from 'react';
import { useWorkflowCommands } from '../api/hooks/useWorkflowCommands';
import type { WorkflowCommandSummary } from '../api/types';

const STATUS_OPTIONS = ['', 'queued', 'processing', 'succeeded', 'failed'];

function PayloadKeys({ keys }: { keys: string[] }) {
  if (keys.length === 0) return <span className="unavailable">—</span>;
  return (
    <div className="meta-keys">
      {keys.map(k => <span key={k} className="meta-pill">{k}</span>)}
    </div>
  );
}

function AttemptBadge({ count }: { count?: number }) {
  if (count === undefined) return <span className="unavailable">—</span>;
  const cls = count >= 3 ? 'attempt-badge attempt-high' : 'attempt-badge';
  return <span className={cls}>{count}</span>;
}

function CommandRow({ cmd }: { cmd: WorkflowCommandSummary }) {
  return (
    <tr>
      <td><code className="mono-cell">{cmd.commandId}</code></td>
      <td>{cmd.type ?? <span className="unavailable">—</span>}</td>
      <td>
        {cmd.status
          ? <span className={`badge status-${cmd.status}`}>{cmd.status}</span>
          : <span className="unavailable">—</span>}
      </td>
      <td><code className="mono-cell">{cmd.patientId ?? '—'}</code></td>
      <td><AttemptBadge count={cmd.attemptCount} /></td>
      <td>{cmd.errorCode ?? <span className="unavailable">—</span>}</td>
      <td className="ts-cell">{cmd.lastAttemptAt ?? <span className="unavailable">—</span>}</td>
      <td className="ts-cell">{cmd.nextAttemptAt ?? <span className="unavailable">—</span>}</td>
      <td><PayloadKeys keys={cmd.payloadKeys} /></td>
    </tr>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="skeleton-row">
          {Array.from({ length: 9 }).map((__, j) => (
            <td key={j}><span className="skeleton-cell" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => setDebounced(value), delay);
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, [value, delay]);
  return debounced;
}

export function WorkflowCommandsScreen() {
  const [statusInput, setStatusInput] = useState('');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [typeInput, setTypeInput] = useState('');

  const patientId = useDebounced(patientIdInput, 400);
  const type = useDebounced(typeInput, 400);

  const { data, isFetching, isError, error } = useWorkflowCommands({
    status: statusInput,
    patientId,
    type,
  });

  const commands = data?.workflowCommands ?? [];
  const hasFilters = statusInput || patientIdInput || typeInput;

  return (
    <div className="screen">
      <div className="wf-filter-bar">
        <label className="field wf-filter-field">
          <span>Status</span>
          <select
            value={statusInput}
            onChange={e => setStatusInput(e.target.value)}
            className="wf-select"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
        </label>

        <label className="field wf-filter-field">
          <span>Patient ID</span>
          <input
            type="search"
            value={patientIdInput}
            onChange={e => setPatientIdInput(e.target.value)}
            placeholder="Any"
            className="search-input wf-filter-input"
          />
        </label>

        <label className="field wf-filter-field">
          <span>Type</span>
          <input
            type="search"
            value={typeInput}
            onChange={e => setTypeInput(e.target.value)}
            placeholder="Any"
            className="search-input wf-filter-input"
          />
        </label>

        {isFetching && <span className="search-spinner wf-spinner" aria-hidden="true" />}
      </div>

      {isError && (
        <div className="screen-error" role="alert">
          {(error as { message?: string }).message ?? 'Failed to load workflow commands. Please try again.'}
        </div>
      )}

      {!isFetching && !isError && commands.length === 0 && (
        <div className="screen-empty">
          {hasFilters ? 'No commands match the current filters.' : 'No workflow commands found.'}
        </div>
      )}

      {(isFetching || commands.length > 0) && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Command ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Patient ID</th>
                <th>Attempts</th>
                <th>Error code</th>
                <th>Last attempt</th>
                <th>Next attempt</th>
                <th>Payload keys</th>
              </tr>
            </thead>
            <tbody>
              {isFetching
                ? <SkeletonRows />
                : commands.map(cmd => <CommandRow key={cmd.commandId} cmd={cmd} />)
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
