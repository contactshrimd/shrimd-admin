import { useState } from 'react';
import { useAdminCatalog } from '../api/hooks/useConditionCatalog';
import {
  useCrossSellRules,
  useCreateCrossSellRule,
  useUpdateCrossSellRule,
  useSetCrossSellRuleEnabled,
} from '../api/hooks/useCrossSellRules';
import type { CrossSellRuleView, CrossSellRuleInput } from '../api/hooks/useCrossSellRules';

type RuleFormState = CrossSellRuleInput & { ruleId?: string };

const DEFAULT_FORM: RuleFormState = {
  name: '',
  triggerType: 'condition',
  sourceConditionIds: [],
  questionKey: null,
  matchValues: [],
  targetConditionId: '',
  benefitStatement: '',
};

export function CrossSellRulesScreen() {
  const { data: rules, isLoading: rulesLoading, isError: rulesError } = useCrossSellRules();
  const { data: catalogRaw } = useAdminCatalog();
  const catalog = (catalogRaw as { conditionId: string; displayName: string }[] | undefined) ?? [];

  const createRule = useCreateCrossSellRule();
  const updateRule = useUpdateCrossSellRule();
  const setEnabled = useSetCrossSellRuleEnabled();

  const [form, setForm] = useState<RuleFormState | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  function conditionName(id: string) {
    return catalog.find((c) => c.conditionId === id)?.displayName ?? id;
  }

  function openCreate() {
    setSaveError(null);
    setForm({ ...DEFAULT_FORM });
  }

  function openEdit(rule: CrossSellRuleView) {
    setSaveError(null);
    setForm({ ...rule });
  }

  function closeForm() {
    setForm(null);
    setSaveError(null);
  }

  async function handleSave() {
    if (!form) return;
    setSaveError(null);
    const input: CrossSellRuleInput = {
      name: form.name,
      triggerType: form.triggerType,
      sourceConditionIds: form.sourceConditionIds,
      questionKey: form.triggerType === 'response' ? form.questionKey : null,
      matchValues: form.triggerType === 'response' ? form.matchValues : [],
      targetConditionId: form.targetConditionId,
      benefitStatement: form.benefitStatement,
    };
    try {
      if (form.ruleId) {
        await updateRule.mutateAsync({ ruleId: form.ruleId, ...input });
      } else {
        await createRule.mutateAsync(input);
      }
      closeForm();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Save failed. Please try again.');
    }
  }

  function updateField<K extends keyof RuleFormState>(key: K, value: RuleFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const isSaving = createRule.isPending || updateRule.isPending;

  if (rulesLoading) return <p>Loading cross-sell rules…</p>;
  if (rulesError || !rules) return <p className="error-text">Failed to load cross-sell rules.</p>;

  return (
    <div className="panel">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3>Cross-Sell Rules</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Rules fire after intake submission. Changes affect new submissions only.
          </p>
        </div>
        {!form && (
          <button type="button" className="btn-primary-sm" onClick={openCreate}>
            New Rule
          </button>
        )}
      </div>

      {form && (
        <div className="panel" style={{ marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '1rem' }}>{form.ruleId ? 'Edit Rule' : 'New Rule'}</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Rule name
              </span>
              <input
                type="text"
                value={form.name}
                maxLength={80}
                placeholder="e.g. Testosterone → Weight Loss"
                onChange={(e) => updateField('name', e.target.value)}
                style={{ width: '100%' }}
              />
            </label>

            <label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Trigger type
              </span>
              <select
                value={form.triggerType}
                onChange={(e) => updateField('triggerType', e.target.value as 'condition' | 'response')}
              >
                <option value="condition">Condition enrolled</option>
                <option value="response">Form response</option>
              </select>
            </label>

            {form.triggerType === 'condition' && (
              <label>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Source conditions (leave empty = all conditions)
                </span>
                <input
                  type="text"
                  value={form.sourceConditionIds.join(', ')}
                  placeholder="testosterone, womens_hrt"
                  onChange={(e) =>
                    updateField(
                      'sourceConditionIds',
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  style={{ width: '100%' }}
                />
              </label>
            )}

            {form.triggerType === 'response' && (
              <>
                <label>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Question key
                  </span>
                  <input
                    type="text"
                    value={form.questionKey ?? ''}
                    placeholder="e.g. bmi_category"
                    onChange={(e) => updateField('questionKey', e.target.value || null)}
                    style={{ width: '100%' }}
                  />
                </label>
                <label>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Match values (comma-separated)
                  </span>
                  <input
                    type="text"
                    value={form.matchValues.join(', ')}
                    placeholder="overweight, obese"
                    onChange={(e) =>
                      updateField(
                        'matchValues',
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    style={{ width: '100%' }}
                  />
                </label>
              </>
            )}

            <label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Target condition
              </span>
              <select
                value={form.targetConditionId}
                onChange={(e) => updateField('targetConditionId', e.target.value)}
              >
                <option value="">— select —</option>
                {catalog.map((c) => (
                  <option key={c.conditionId} value={c.conditionId}>
                    {c.displayName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Benefit statement ({form.benefitStatement.length}/120)
              </span>
              <textarea
                value={form.benefitStatement}
                maxLength={120}
                rows={2}
                placeholder="Many patients managing hormones also benefit from structured weight support."
                onChange={(e) => updateField('benefitStatement', e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </label>

            {saveError && <p className="error-text" style={{ margin: 0 }}>{saveError}</p>}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-primary-sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn-secondary-sm" onClick={closeForm} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rules.length === 0 && !form ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No rules yet. Create one to start offering cross-sell conditions to patients.
        </p>
      ) : (
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th style={{ textAlign: 'left', width: '120px' }}>Trigger</th>
              <th style={{ textAlign: 'left', width: '140px' }}>Target</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Status</th>
              <th style={{ textAlign: 'center', width: '140px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule: CrossSellRuleView) => {
              const toggling = setEnabled.isPending && setEnabled.variables?.ruleId === rule.ruleId;
              return (
                <tr key={rule.ruleId}>
                  <td style={{ fontWeight: 500 }}>{rule.name}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {rule.triggerType === 'condition'
                        ? rule.sourceConditionIds.length === 0
                          ? 'Any condition'
                          : rule.sourceConditionIds.join(', ')
                        : `${rule.questionKey}: ${rule.matchValues.join(', ')}`}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{conditionName(rule.targetConditionId)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-pill ${rule.enabled ? 'status-active' : 'status-inactive'}`}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-secondary-sm"
                        onClick={() => openEdit(rule)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={rule.enabled ? 'btn-danger-sm' : 'btn-primary-sm'}
                        disabled={toggling || setEnabled.isPending}
                        onClick={() =>
                          setEnabled.mutate({ ruleId: rule.ruleId, enabled: !rule.enabled })
                        }
                      >
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
