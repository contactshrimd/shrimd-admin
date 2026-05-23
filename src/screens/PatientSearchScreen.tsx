import { useEffect, useRef, useState } from 'react';
import { usePatientSearch } from '../api/hooks/usePatientSearch';
import type { AdminPatientSummary } from '../api/types';

function StatusBadge({ value }: { value?: string }) {
  if (!value) return <span className="badge badge-unavailable">—</span>;
  return <span className="badge">{value}</span>;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="skeleton-row">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j}><span className="skeleton-cell" /></td>
          ))}
        </tr>
      ))}
    </>
  );
}

function PatientRow({
  patient,
  onSelect,
}: {
  patient: AdminPatientSummary;
  onSelect: (id: string) => void;
}) {
  return (
    <tr className="row-clickable" onClick={() => onSelect(patient.patientId)}>
      <td>{patient.displayName ?? <span className="unavailable">—</span>}</td>
      <td><code className="patient-id">{patient.patientId}</code></td>
      <td>{patient.state ?? <span className="unavailable">—</span>}</td>
      <td><StatusBadge value={patient.lifecycleState} /></td>
      <td><StatusBadge value={patient.reviewStatus} /></td>
      <td><StatusBadge value={patient.subscriptionStatus} /></td>
    </tr>
  );
}

export function PatientSearchScreen({ onSelectPatient }: { onSelectPatient: (id: string) => void }) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(input.trim()), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input]);

  const { data, isFetching, isError, error } = usePatientSearch(query);
  const patients = data?.patients ?? [];

  return (
    <div className="screen">
      <div className="search-bar">
        <input
          type="search"
          placeholder="Search by name, email, or patient ID…"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="search-input"
          aria-label="Search patients"
        />
        {isFetching && <span className="search-spinner" aria-hidden="true" />}
      </div>

      {isError && (
        <div className="screen-error" role="alert">
          {(error as { message?: string }).message ?? 'Search failed. Please try again.'}
        </div>
      )}

      {!isFetching && !isError && patients.length === 0 && (
        <div className="screen-empty">{query ? `No patients found for "${query}".` : 'No patients found.'}</div>
      )}

      {(isFetching || (!isError && patients.length > 0)) && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Patient ID</th>
                <th>State</th>
                <th>Lifecycle</th>
                <th>Review</th>
                <th>Subscription</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <SkeletonRows />
              ) : (
                patients.map(p => <PatientRow key={p.patientId} patient={p} onSelect={onSelectPatient} />)
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
