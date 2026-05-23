import { useState } from 'react';
import {
  useAdminCatalog,
  useUpdateConditionCatalog,
  type AdminCatalogCondition,
  type CatalogConditionInput,
  type CatalogPlanInput,
} from '../api/hooks/useConditionCatalog';
import { useStripePrices, useStripeCoupons } from '../api/hooks/useStripeLookup';

const VALID_ICONS = [
  { emoji: '💪', label: 'Testosterone' },
  { emoji: '🌸', label: "Women's HRT" },
  { emoji: '🧠', label: 'Mental Health' },
  { emoji: '⚡', label: 'Migraine / ADHD' },
  { emoji: '🤰', label: 'Fertility' },
  { emoji: '🦋', label: 'Thyroid' },
  { emoji: '😴', label: 'Sleep' },
  { emoji: '✨', label: 'Skin' },
];

const DEFAULT_PLAN: PlanFormState = {
  planId: 'standard',
  tierName: 'Standard',
  bullets: [''],
  stripePriceId: '',
  stripeCouponId: '',
  discountLabel: '',
};

const CONDITION_STUBS: AdminCatalogCondition[] = [
  { conditionId: 'testosterone',  displayName: "Testosterone / Men's HRT",  shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '💪', sortOrder: 0, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
  { conditionId: 'womens_hrt',    displayName: "Women's HRT / Menopause",   shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '🌸', sortOrder: 1, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
  { conditionId: 'mental_health', displayName: 'Mental Health',             shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '🧠', sortOrder: 2, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
  { conditionId: 'migraine',      displayName: 'Migraine',                  shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '⚡', sortOrder: 3, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
  { conditionId: 'fertility',     displayName: 'Fertility',                 shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '🤰', sortOrder: 4, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
  { conditionId: 'thyroid',       displayName: 'Thyroid / Autoimmune',      shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '🦋', sortOrder: 5, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
  { conditionId: 'sleep',         displayName: 'Sleep',                     shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '😴', sortOrder: 6, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
  { conditionId: 'skin',          displayName: 'Chronic Skin / Derm',       shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '✨', sortOrder: 7, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
  { conditionId: 'adhd',          displayName: 'Non-Stimulant ADHD',        shortDescription: '', whatIsIt: '', whoIsItFor: '', iconIdentifier: '⚡', sortOrder: 8, plans: [], stripeWarnings: [], lastUpdatedBy: '', lastUpdatedAt: '' },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatPrice(amountCents: number, currency: string, interval: string): string {
  const amount = (amountCents / 100).toFixed(2);
  return `$${amount} / ${interval} (${currency.toUpperCase()})`;
}

function formatCoupon(amountOffCents: number | null, percentOff: number | null): string {
  if (amountOffCents !== null) return `$${(amountOffCents / 100).toFixed(2)} off`;
  if (percentOff !== null) return `${percentOff}% off`;
  return '';
}

type PlanFormState = {
  planId: string;
  tierName: string;
  bullets: string[];
  stripePriceId: string;
  stripeCouponId: string;
  discountLabel: string;
};

function planToFormState(plan: CatalogPlanInput | { planId: string; tierName: string; bullets: string[]; stripePriceId: string; stripeCouponId: string | null; discountLabel: string | null }): PlanFormState {
  return {
    planId: plan.planId,
    tierName: plan.tierName,
    bullets: [...plan.bullets],
    stripePriceId: plan.stripePriceId,
    stripeCouponId: plan.stripeCouponId ?? '',
    discountLabel: plan.discountLabel ?? '',
  };
}

type ConditionFormState = {
  displayName: string;
  shortDescription: string;
  whatIsIt: string;
  whoIsItFor: string;
  iconIdentifier: string;
  sortOrder: number;
  plans: PlanFormState[];
};

function conditionToFormState(c: AdminCatalogCondition): ConditionFormState {
  return {
    displayName: c.displayName,
    shortDescription: c.shortDescription,
    whatIsIt: c.whatIsIt,
    whoIsItFor: c.whoIsItFor,
    iconIdentifier: c.iconIdentifier,
    sortOrder: c.sortOrder,
    plans: c.plans.length > 0 ? c.plans.map(planToFormState) : [{ ...DEFAULT_PLAN }],
  };
}

function ConditionRow({ condition }: { condition: AdminCatalogCondition }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<ConditionFormState>(() => conditionToFormState(condition));
  const [saveError, setSaveError] = useState<string | null>(null);
  const update = useUpdateConditionCatalog();

  const {
    data: pricesData,
    isLoading: pricesLoading,
    isError: pricesError,
    refetch: refetchPrices,
  } = useStripePrices();

  const {
    data: couponsData,
    isLoading: couponsLoading,
    isError: couponsError,
    refetch: refetchCoupons,
  } = useStripeCoupons();

  const prices = pricesData?.prices ?? [];
  const coupons = couponsData?.coupons ?? [];

  function updatePlan(idx: number, patch: Partial<PlanFormState>) {
    setForm((f) => {
      const plans = [...f.plans];
      plans[idx] = { ...plans[idx], ...patch };
      if (patch.stripeCouponId !== undefined && patch.stripeCouponId === '') {
        plans[idx].discountLabel = '';
      }
      return { ...f, plans };
    });
  }

  function addBullet(planIdx: number) {
    setForm((f) => {
      const plans = [...f.plans];
      plans[planIdx] = { ...plans[planIdx], bullets: [...plans[planIdx].bullets, ''] };
      return { ...f, plans };
    });
  }

  function updateBullet(planIdx: number, bulletIdx: number, value: string) {
    setForm((f) => {
      const plans = [...f.plans];
      const bullets = [...plans[planIdx].bullets];
      bullets[bulletIdx] = value;
      plans[planIdx] = { ...plans[planIdx], bullets };
      return { ...f, plans };
    });
  }

  function removeBullet(planIdx: number, bulletIdx: number) {
    setForm((f) => {
      const plans = [...f.plans];
      const bullets = plans[planIdx].bullets.filter((_, i) => i !== bulletIdx);
      plans[planIdx] = { ...plans[planIdx], bullets };
      return { ...f, plans };
    });
  }

  function addPlan() {
    if (form.plans.length >= 4) return;
    setForm((f) => ({
      ...f,
      plans: [
        ...f.plans,
        { planId: `plan_${Date.now()}`, tierName: '', bullets: [''], stripePriceId: '', stripeCouponId: '', discountLabel: '' },
      ],
    }));
  }

  function removePlan(idx: number) {
    if (form.plans.length <= 1) return;
    setForm((f) => ({ ...f, plans: f.plans.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    setSaveError(null);
    const body: CatalogConditionInput = {
      displayName: form.displayName,
      shortDescription: form.shortDescription,
      whatIsIt: form.whatIsIt,
      whoIsItFor: form.whoIsItFor,
      iconIdentifier: form.iconIdentifier,
      sortOrder: form.sortOrder,
      plans: form.plans.map((p) => ({
        planId: p.planId,
        tierName: p.tierName,
        bullets: p.bullets.filter((b) => b.trim().length > 0),
        stripePriceId: p.stripePriceId,
        stripeCouponId: p.stripeCouponId || null,
        discountLabel: p.stripeCouponId ? p.discountLabel : null,
      })),
    };
    try {
      await update.mutateAsync({ conditionId: condition.conditionId, body });
      setExpanded(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Save failed. Please try again.');
    }
  }

  const warningsByPlan = condition.stripeWarnings.reduce<Record<string, string[]>>((acc, w) => {
    acc[w.planId] = [...(acc[w.planId] ?? []), w.message];
    return acc;
  }, {});

  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
      {/* Collapsed header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{condition.iconIdentifier}</span>
          <div>
            <p style={{ fontWeight: 600, margin: 0 }}>{condition.displayName}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              {condition.lastUpdatedAt
                ? `${condition.plans.length} plan${condition.plans.length !== 1 ? 's' : ''}`
                : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not yet configured</span>}
              {condition.stripeWarnings.length > 0 && (
                <span style={{ color: '#b45309', marginLeft: '0.5rem' }}>
                  ⚠ {condition.stripeWarnings.length} Stripe warning{condition.stripeWarnings.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
            {condition.lastUpdatedAt && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                Last updated {formatDate(condition.lastUpdatedAt)}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="btn-primary-sm"
          onClick={() => {
            setForm(conditionToFormState(condition));
            setSaveError(null);
            setExpanded((e) => !e);
          }}
        >
          {expanded ? 'Collapse' : condition.lastUpdatedAt ? 'Edit' : 'Configure'}
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Display fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Display Name</label>
              <input
                className="form-input"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                maxLength={120}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Icon</label>
              <select
                className="form-input"
                value={form.iconIdentifier}
                onChange={(e) => setForm((f) => ({ ...f, iconIdentifier: e.target.value }))}
              >
                {VALID_ICONS.map((icon) => (
                  <option key={icon.emoji} value={icon.emoji}>
                    {icon.emoji} {icon.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Short Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(condition list card)</span></label>
              <textarea
                className="form-input"
                value={form.shortDescription}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                maxLength={300}
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>What is it? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(detail page)</span></label>
              <textarea
                className="form-input"
                value={form.whatIsIt}
                onChange={(e) => setForm((f) => ({ ...f, whatIsIt: e.target.value }))}
                maxLength={600}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Who is it for? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(detail page)</span></label>
              <textarea
                className="form-input"
                value={form.whoIsItFor}
                onChange={(e) => setForm((f) => ({ ...f, whoIsItFor: e.target.value }))}
                maxLength={400}
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Sort Order</label>
              <input
                className="form-input"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
          </div>

          {/* Plans */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Plans</p>
            {form.plans.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No plans configured. Add a plan below.</p>
            )}
            {form.plans.map((plan, planIdx) => {
              const planWarnings = warningsByPlan[plan.planId] ?? [];
              return (
                <div
                  key={planIdx}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.875rem',
                    marginBottom: '0.75rem',
                    background: '#fafafa',
                  }}
                >
                  {/* Stripe warnings */}
                  {planWarnings.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '4px',
                        padding: '0.5rem 0.75rem',
                        marginBottom: '0.75rem',
                        fontSize: '0.8rem',
                        color: '#92400e',
                      }}
                    >
                      ⚠ {msg}
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Plan ID</label>
                      <input
                        className="form-input"
                        value={plan.planId}
                        onChange={(e) => updatePlan(planIdx, { planId: e.target.value })}
                        placeholder="e.g. standard"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Tier Name</label>
                      <input
                        className="form-input"
                        value={plan.tierName}
                        onChange={(e) => updatePlan(planIdx, { tierName: e.target.value })}
                        placeholder="e.g. Standard"
                        maxLength={60}
                      />
                    </div>
                    {form.plans.length > 1 && (
                      <button
                        type="button"
                        className="btn-danger-sm"
                        onClick={() => removePlan(planIdx)}
                        style={{ flexShrink: 0 }}
                      >
                        Remove plan
                      </button>
                    )}
                  </div>

                  {/* Bullets */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Feature Bullets</label>
                    {plan.bullets.map((bullet, bulletIdx) => (
                      <div key={bulletIdx} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                        <input
                          className="form-input"
                          value={bullet}
                          onChange={(e) => updateBullet(planIdx, bulletIdx, e.target.value)}
                          placeholder="Feature description"
                          maxLength={120}
                          style={{ flex: 1 }}
                        />
                        {plan.bullets.length > 1 && (
                          <button
                            type="button"
                            className="btn-danger-sm"
                            onClick={() => removeBullet(planIdx, bulletIdx)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {plan.bullets.length < 10 && (
                      <button
                        type="button"
                        className="btn-primary-sm"
                        onClick={() => addBullet(planIdx)}
                        style={{ marginTop: '0.5rem' }}
                      >
                        + Add bullet
                      </button>
                    )}
                  </div>

                  {/* Stripe Price */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Stripe Price</label>
                    {pricesError ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select className="form-input" disabled style={{ flex: 1 }}>
                          <option>Failed to load from Stripe — existing value preserved</option>
                        </select>
                        <button type="button" className="btn-primary-sm" onClick={() => refetchPrices()}>
                          Retry
                        </button>
                      </div>
                    ) : (
                      <select
                        className="form-input"
                        value={plan.stripePriceId}
                        onChange={(e) => updatePlan(planIdx, { stripePriceId: e.target.value })}
                        disabled={pricesLoading}
                      >
                        <option value="">{pricesLoading ? 'Loading prices…' : '— Select a Stripe Price —'}</option>
                        {prices.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.productName} — {formatPrice(p.amountCents, p.currency, p.interval)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Stripe Coupon */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Stripe Coupon (optional)</label>
                    {couponsError ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select className="form-input" disabled style={{ flex: 1 }}>
                          <option>Failed to load from Stripe — existing value preserved</option>
                        </select>
                        <button type="button" className="btn-primary-sm" onClick={() => refetchCoupons()}>
                          Retry
                        </button>
                      </div>
                    ) : (
                      <select
                        className="form-input"
                        value={plan.stripeCouponId}
                        onChange={(e) => updatePlan(planIdx, { stripeCouponId: e.target.value })}
                        disabled={couponsLoading}
                      >
                        <option value="">{couponsLoading ? 'Loading coupons…' : 'No discount'}</option>
                        {coupons.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} — {formatCoupon(c.amountOffCents, c.percentOff)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Discount label — only when coupon is selected */}
                  {plan.stripeCouponId && (
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Discount Label (patient-facing)</label>
                      <input
                        className="form-input"
                        value={plan.discountLabel}
                        onChange={(e) => updatePlan(planIdx, { discountLabel: e.target.value })}
                        placeholder="e.g. First order discount"
                        maxLength={80}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {form.plans.length < 4 && (
              <button type="button" className="btn-primary-sm" onClick={addPlan}>
                + Add plan
              </button>
            )}
          </div>

          {/* Save */}
          {saveError && (
            <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>{saveError}</p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-primary-sm"
              onClick={handleSave}
              disabled={update.isPending}
              style={{ padding: '0.5rem 1.5rem' }}
            >
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setExpanded(false); setSaveError(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConditionCatalogScreen() {
  const { data: conditions, isLoading, isError } = useAdminCatalog();

  if (isLoading) return <p>Loading condition catalog…</p>;
  if (isError || !conditions) return <p className="error-text">Failed to load condition catalog.</p>;

  const merged = CONDITION_STUBS.map(
    (stub) => conditions.find((c) => c.conditionId === stub.conditionId) ?? stub
  );

  return (
    <div className="panel">
      <div style={{ marginBottom: '1.5rem' }}>
        <h3>Condition Catalog</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Configure condition names, plan options, feature bullets, Stripe prices, and discounts.
          Changes take effect for patients within 5 minutes.
        </p>
      </div>

      {merged.map((condition) => (
        <ConditionRow key={condition.conditionId} condition={condition} />
      ))}
    </div>
  );
}
