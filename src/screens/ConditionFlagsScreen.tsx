import { VERTICALS, useConditionFlags, useSetConditionFlag, VerticalId } from '../api/hooks/useConditionFlags';

export function ConditionFlagsScreen() {
  const { data: flags, isLoading, isError } = useConditionFlags();
  const setFlag = useSetConditionFlag();

  const toggle = (id: VerticalId, current: boolean) => {
    setFlag.mutate({ [id]: !current });
  };

  if (isLoading) return <p>Loading condition flags…</p>;
  if (isError || !flags) return <p className="error-text">Failed to load condition flags.</p>;

  return (
    <div className="panel">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3>Condition Launch Flags</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Enable conditions to make them visible and selectable in the patient app.
          Disabled conditions are hidden from the browse list and their detail pages are inaccessible.
        </p>
      </div>

      <table className="data-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Condition</th>
            <th style={{ textAlign: 'center', width: '120px' }}>Status</th>
            <th style={{ textAlign: 'center', width: '120px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {VERTICALS.map(v => {
            const launched = flags[v.id] ?? false;
            const pending = setFlag.isPending && (setFlag.variables as any)?.[v.id] !== undefined;
            return (
              <tr key={v.id}>
                <td style={{ fontWeight: 500 }}>{v.name}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-pill ${launched ? 'status-active' : 'status-inactive'}`}>
                    {launched ? 'Live' : 'Hidden'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className={launched ? 'btn-danger-sm' : 'btn-primary-sm'}
                    disabled={pending || setFlag.isPending}
                    onClick={() => toggle(v.id, launched)}
                  >
                    {launched ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
