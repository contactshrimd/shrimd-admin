import { useConditionFlags, useSetConditionFlag, useAdminCatalogForFlags } from '../api/hooks/useConditionFlags';
import type { SellType } from '../api/hooks/useConditionCatalog';

const SELL_TYPE_LABELS: Record<SellType, string> = {
  front_sell: 'Front-sell',
  cross_sell: 'Cross-sell',
  both: 'Both',
};

export function ConditionFlagsScreen() {
  const { data: flags, isLoading: flagsLoading, isError: flagsError } = useConditionFlags();
  const { data: catalog, isLoading: catalogLoading, isError: catalogError } = useAdminCatalogForFlags();
  const setFlag = useSetConditionFlag();

  const toggle = (id: string, current: boolean) => {
    setFlag.mutate({ conditionId: id, enabled: !current });
  };

  if (flagsLoading || catalogLoading) return <p>Loading condition flags…</p>;
  if (flagsError || catalogError || !flags || !catalog) return <p className="error-text">Failed to load condition flags.</p>;

  if (catalog.length === 0) {
    return (
      <div className="panel">
        <h3>Condition Launch Flags</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>
          No conditions in catalog. Add conditions in the Condition Catalog tab first.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3>Condition Launch Flags</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Enable conditions to make them visible in the patient app.
          Cross-sell conditions are never shown in the primary list regardless of flag.
        </p>
      </div>

      <table className="data-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Condition</th>
            <th style={{ textAlign: 'left', width: '120px' }}>Sell Type</th>
            <th style={{ textAlign: 'center', width: '100px' }}>Status</th>
            <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {catalog.map((condition) => {
            const launched = flags[condition.conditionId] ?? false;
            const pending = setFlag.isPending && setFlag.variables?.conditionId === condition.conditionId;
            const sellType = condition.sellType ?? 'front_sell';
            return (
              <tr key={condition.conditionId}>
                <td style={{ fontWeight: 500 }}>
                  <span style={{ marginRight: '0.5rem' }}>{condition.iconIdentifier}</span>
                  {condition.displayName}
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {SELL_TYPE_LABELS[sellType]}
                  </span>
                </td>
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
                    onClick={() => toggle(condition.conditionId, launched)}
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
