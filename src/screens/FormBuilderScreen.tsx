import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../api/client';
import {
  useFormConfig,
  useFormList,
  useFormVersions,
  useMigrateForms,
  usePublishForm,
  useSaveDraft,
} from '../api/hooks/useFormConfig';
import type { ClinicalReviewMetadata, Question, QuestionType, VisibilityRule } from '../api/types';

const KNOWN_CONDITIONS = [
  'testosterone',
  'womens_hrt',
  'mental_health',
  'migraine',
  'fertility',
  'thyroid',
  'sleep',
  'skin',
  'adhd',
];

const QUESTION_TYPES: QuestionType[] = [
  'boolean',
  'text',
  'single_select',
  'multi_select',
  'boolean_with_text',
];

function emptyQuestion(index: number): Question {
  return {
    id: `question_${index + 1}`,
    type: 'boolean',
    label: '',
    required: true,
  };
}

function formatDate(value: string | null): string {
  if (!value) return 'Not published';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function hasContraChanges(previous: Question[], next: Question[]): boolean {
  const signature = (questions: Question[]) =>
    JSON.stringify(
      questions
        .filter(q => q.contraIndication)
        .map(q => ({ id: q.id, contraIndication: q.contraIndication }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    );

  return signature(previous) !== signature(next);
}

function normalizeQuestion(question: Question): Question {
  const normalized: Question = {
    ...question,
    options:
      question.type === 'single_select' || question.type === 'multi_select'
        ? question.options && question.options.length > 0
          ? question.options
          : [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ]
        : undefined,
    followUpPrompt: question.type === 'boolean_with_text' ? question.followUpPrompt ?? '' : undefined,
  };

  if (question.type !== 'boolean' && question.type !== 'single_select') {
    delete normalized.contraIndication;
  }

  return normalized;
}

function defaultVisibilityRule(sourceQuestion?: Question): VisibilityRule {
  return {
    sourceQuestionId: sourceQuestion?.id ?? '',
    operator: 'is',
    value: sourceQuestion?.type === 'boolean' || sourceQuestion?.type === 'boolean_with_text'
      ? 'yes'
      : sourceQuestion?.options?.[0]?.value ?? '',
  };
}

function valueOptionsFor(question?: Question) {
  if (!question) return [];
  if (question.type === 'boolean' || question.type === 'boolean_with_text') {
    return [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ];
  }
  return question.options ?? [];
}

type PreviewAnswers = Record<string, unknown>;

function previewAnswerValue(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    (value as { choice?: unknown }).choice === 'yes'
  ) {
    return 'yes';
  }
  return null;
}

function previewRuleMatches(question: Question, answers: PreviewAnswers, questions: Question[]) {
  const rules = question.visibilityRules ?? [];
  if (rules.length === 0) return true;

  const results = rules.map(rule => {
    const sourceExists = questions.some(candidate => candidate.id === rule.sourceQuestionId);
    if (!sourceExists) return true;

    const answer = answers[rule.sourceQuestionId];
    if (rule.operator === 'contains') {
      return Array.isArray(answer) && answer.includes(rule.value);
    }

    const comparable = previewAnswerValue(answer);
    return rule.operator === 'is' ? comparable === rule.value : comparable !== rule.value;
  });

  return (question.visibilityLogic ?? 'and') === 'or' ? results.some(Boolean) : results.every(Boolean);
}

function previewContra(question: Question, value: unknown) {
  const config = question.contraIndication;
  if (!config) return null;
  return previewAnswerValue(value) === config.triggerValue ? config : null;
}

function FormPreview({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<PreviewAnswers>({});
  const visibleQuestions = questions.filter(question => previewRuleMatches(question, answers, questions));
  const blocked = visibleQuestions
    .map(question => ({ question, config: previewContra(question, answers[question.id]) }))
    .find(result => result.config);
  const activeBlock = blocked?.config;

  useEffect(() => {
    const visibleIds = new Set(visibleQuestions.map(question => question.id));
    setAnswers(current => {
      const next = Object.fromEntries(Object.entries(current).filter(([id]) => visibleIds.has(id)));
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [visibleQuestions]);

  function setAnswer(question: Question, value: unknown) {
    setAnswers(current => ({ ...current, [question.id]: value }));
  }

  return (
    <section className="panel form-builder-panel">
      <div className="form-builder-question-header">
        <h3>Live Preview</h3>
        <button type="button" className="export-button" onClick={() => setAnswers({})}>
          Reset
        </button>
      </div>

      {questions.length === 0 ? (
        <p>No draft questions to preview.</p>
      ) : activeBlock ? (
        <div className={activeBlock.severity === 'escalation' ? 'form-preview-block escalation' : 'form-preview-block'}>
          <strong>{activeBlock.severity === 'escalation' ? 'Escalation block' : 'Standard block'}</strong>
          <p>{activeBlock.message}</p>
        </div>
      ) : (
        <div className="form-preview-list">
          {visibleQuestions.map(question => (
            <div className="form-preview-question" key={question.id}>
              <label className="field">
                <span>{question.label || question.id}</span>
                {renderPreviewInput(question, answers[question.id], value => setAnswer(question, value))}
              </label>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function renderPreviewInput(question: Question, value: unknown, onChange: (value: unknown) => void) {
  if (question.type === 'boolean' || question.type === 'boolean_with_text') {
    const choice = previewAnswerValue(value) ?? '';
    return (
      <select className="wf-select" value={choice} onChange={e => onChange(e.target.value)}>
        <option value="">Choose</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    );
  }

  if (question.type === 'single_select') {
    return (
      <select
        className="wf-select"
        value={typeof value === 'string' ? value : ''}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Choose</option>
        {(question.options ?? []).map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  }

  if (question.type === 'multi_select') {
    const selected = Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    return (
      <div className="form-preview-checkboxes">
        {(question.options ?? []).map(option => (
          <label key={option.value} className="form-preview-checkbox">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={e =>
                onChange(
                  e.target.checked
                    ? [...selected, option.value]
                    : selected.filter(item => item !== option.value),
                )
              }
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <input
      className="search-input"
      value={typeof value === 'string' ? value : ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Answer"
    />
  );
}

function QuestionEditor({
  question,
  index,
  canMoveUp,
  canMoveDown,
  onChange,
  onRemove,
  onMove,
  priorQuestions,
}: {
  question: Question;
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (question: Question) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  priorQuestions: Question[];
}) {
  function patch(patchValue: Partial<Question>) {
    onChange(normalizeQuestion({ ...question, ...patchValue }));
  }

  const supportsOptions = question.type === 'single_select' || question.type === 'multi_select';
  const supportsContra = question.type === 'boolean' || question.type === 'single_select';
  const visibilityRules = question.visibilityRules ?? [];

  return (
    <section className="form-builder-question">
      <div className="form-builder-question-header">
        <strong>Question {index + 1}</strong>
        <div className="form-builder-actions">
          <button type="button" className="export-button" disabled={!canMoveUp} onClick={() => onMove(-1)}>
            Up
          </button>
          <button type="button" className="export-button" disabled={!canMoveDown} onClick={() => onMove(1)}>
            Down
          </button>
          <button type="button" className="btn-danger-sm" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>

      <div className="form-builder-grid">
        <label className="field">
          <span>ID</span>
          <input
            className="search-input"
            value={question.id}
            onChange={e => patch({ id: e.target.value })}
            placeholder="stable_question_id"
          />
        </label>
        <label className="field">
          <span>Type</span>
          <select
            className="wf-select"
            value={question.type}
            onChange={e => patch({ type: e.target.value as QuestionType })}
          >
            {QUESTION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Label</span>
        <input
          className="search-input"
          value={question.label}
          onChange={e => patch({ label: e.target.value })}
          placeholder="Question shown to patient"
        />
      </label>

      <div className="form-builder-grid">
        <label className="field">
          <span>Hint</span>
          <input
            className="search-input"
            value={question.hint ?? ''}
            onChange={e => patch({ hint: e.target.value || undefined })}
          />
        </label>
        <label className="field form-builder-checkbox">
          <input
            type="checkbox"
            checked={question.required}
            onChange={e => patch({ required: e.target.checked })}
          />
          <span>Required</span>
        </label>
      </div>

      {question.type === 'boolean_with_text' && (
        <label className="field">
          <span>Follow-up prompt</span>
          <input
            className="search-input"
            value={question.followUpPrompt ?? ''}
            onChange={e => patch({ followUpPrompt: e.target.value })}
            placeholder="Tell us more"
          />
        </label>
      )}

      {supportsOptions && (
        <div className="form-builder-subpanel">
          <div className="form-builder-question-header">
            <strong>Options</strong>
            <button
              type="button"
              className="export-button"
              onClick={() =>
                patch({
                  options: [
                    ...(question.options ?? []),
                    { label: '', value: `option_${(question.options?.length ?? 0) + 1}` },
                  ],
                })
              }
            >
              Add option
            </button>
          </div>
          {(question.options ?? []).map((option, optionIndex) => (
            <div className="form-builder-option-row" key={`${question.id}-option-${optionIndex}`}>
              <input
                className="search-input"
                value={option.label}
                onChange={e => {
                  const options = [...(question.options ?? [])];
                  options[optionIndex] = { ...options[optionIndex], label: e.target.value };
                  patch({ options });
                }}
                placeholder="Label"
              />
              <input
                className="search-input"
                value={option.value}
                onChange={e => {
                  const options = [...(question.options ?? [])];
                  options[optionIndex] = { ...options[optionIndex], value: e.target.value };
                  patch({ options });
                }}
                placeholder="value"
              />
              <button
                type="button"
                className="btn-danger-sm"
                disabled={(question.options?.length ?? 0) <= 2}
                onClick={() => patch({ options: (question.options ?? []).filter((_, i) => i !== optionIndex) })}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="form-builder-subpanel">
        <div className="form-builder-question-header">
          <strong>Visibility Rules</strong>
          <button
            type="button"
            className="export-button"
            disabled={priorQuestions.length === 0 || visibilityRules.length >= 3}
            onClick={() =>
              patch({
                visibilityRules: [...visibilityRules, defaultVisibilityRule(priorQuestions[0])],
                visibilityLogic: question.visibilityLogic ?? 'and',
              })
            }
          >
            Add rule
          </button>
        </div>

        {priorQuestions.length === 0 ? (
          <p className="form-builder-help">Visibility rules can reference questions above this one.</p>
        ) : visibilityRules.length === 0 ? (
          <p className="form-builder-help">Always visible.</p>
        ) : (
          <>
            <label className="field form-builder-rule-logic">
              <span>Combine rules</span>
              <select
                className="wf-select"
                value={question.visibilityLogic ?? 'and'}
                onChange={e => patch({ visibilityLogic: e.target.value as 'and' | 'or' })}
              >
                <option value="and">AND</option>
                <option value="or">OR</option>
              </select>
            </label>
            {visibilityRules.map((rule, ruleIndex) => {
              const sourceQuestion = priorQuestions.find(candidate => candidate.id === rule.sourceQuestionId);
              const valueOptions = valueOptionsFor(sourceQuestion);
              return (
                <div className="form-builder-rule-row" key={`${question.id}-visibility-${ruleIndex}`}>
                  <select
                    className="wf-select"
                    value={rule.sourceQuestionId}
                    onChange={e => {
                      const nextSource = priorQuestions.find(candidate => candidate.id === e.target.value);
                      const nextRules = [...visibilityRules];
                      nextRules[ruleIndex] = defaultVisibilityRule(nextSource);
                      patch({ visibilityRules: nextRules });
                    }}
                  >
                    {priorQuestions.map(source => (
                      <option key={source.id} value={source.id}>{source.id}</option>
                    ))}
                  </select>
                  <select
                    className="wf-select"
                    value={rule.operator}
                    onChange={e => {
                      const nextRules = [...visibilityRules];
                      nextRules[ruleIndex] = { ...rule, operator: e.target.value as VisibilityRule['operator'] };
                      patch({ visibilityRules: nextRules });
                    }}
                  >
                    <option value="is">is</option>
                    <option value="is_not">is not</option>
                    <option value="contains">contains</option>
                  </select>
                  {valueOptions.length > 0 ? (
                    <select
                      className="wf-select"
                      value={rule.value}
                      onChange={e => {
                        const nextRules = [...visibilityRules];
                        nextRules[ruleIndex] = { ...rule, value: e.target.value };
                        patch({ visibilityRules: nextRules });
                      }}
                    >
                      {valueOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="search-input"
                      value={rule.value}
                      onChange={e => {
                        const nextRules = [...visibilityRules];
                        nextRules[ruleIndex] = { ...rule, value: e.target.value };
                        patch({ visibilityRules: nextRules });
                      }}
                      placeholder="value"
                    />
                  )}
                  <button
                    type="button"
                    className="btn-danger-sm"
                    onClick={() => {
                      const nextRules = visibilityRules.filter((_, i) => i !== ruleIndex);
                      patch({
                        visibilityRules: nextRules.length > 0 ? nextRules : undefined,
                        visibilityLogic: nextRules.length > 0 ? question.visibilityLogic ?? 'and' : undefined,
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>

      {supportsContra && (
        <div className="form-builder-subpanel">
          <label className="field form-builder-checkbox">
            <input
              type="checkbox"
              checked={Boolean(question.contraIndication)}
              onChange={e =>
                patch({
                  contraIndication: e.target.checked
                    ? {
                        severity: 'standard',
                        triggerValue: question.type === 'boolean' ? 'yes' : question.options?.[0]?.value ?? '',
                        message: '',
                      }
                    : undefined,
                })
              }
            />
            <span>Contraindication rule</span>
          </label>
          {question.contraIndication && (
            <div className="form-builder-grid">
              <label className="field">
                <span>Severity</span>
                <select
                  className="wf-select"
                  value={question.contraIndication.severity}
                  onChange={e =>
                    patch({
                      contraIndication: {
                        ...question.contraIndication!,
                        severity: e.target.value as 'standard' | 'escalation',
                      },
                    })
                  }
                >
                  <option value="standard">standard</option>
                  <option value="escalation">escalation</option>
                </select>
              </label>
              <label className="field">
                <span>Trigger value</span>
                <input
                  className="search-input"
                  value={question.contraIndication.triggerValue}
                  onChange={e =>
                    patch({
                      contraIndication: {
                        ...question.contraIndication!,
                        triggerValue: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="field form-builder-wide">
                <span>Message</span>
                <input
                  className="search-input"
                  value={question.contraIndication.message}
                  onChange={e =>
                    patch({
                      contraIndication: {
                        ...question.contraIndication!,
                        message: e.target.value,
                      },
                    })
                  }
                />
              </label>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function FormBuilderScreen() {
  const formList = useFormList();
  const saveDraft = useSaveDraft();
  const publishForm = usePublishForm();
  const migrateForms = useMigrateForms();

  const conditionIds = useMemo(() => {
    const fromApi = formList.data?.forms.map(form => form.conditionId) ?? [];
    return Array.from(new Set([...fromApi, ...KNOWN_CONDITIONS])).sort();
  }, [formList.data?.forms]);

  const [conditionId, setConditionId] = useState(conditionIds[0] ?? 'migraine');
  const [draftQuestions, setDraftQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReloadAction, setShowReloadAction] = useState(false);

  const formConfig = useFormConfig(conditionId);
  const versions = useFormVersions(conditionId);
  const config = formConfig.data;
  const configMissing =
    formConfig.error instanceof ApiClientError && formConfig.error.statusCode === 404;

  useEffect(() => {
    if (conditionIds.length > 0 && !conditionIds.includes(conditionId)) {
      setConditionId(conditionIds[0]);
    }
  }, [conditionId, conditionIds]);

  useEffect(() => {
    if (config) {
      setDraftQuestions(config.draftQuestions.length > 0 ? config.draftQuestions : config.publishedQuestions);
      setMessage(null);
      setErrorMessage(null);
      setShowReloadAction(false);
    } else if (configMissing) {
      setDraftQuestions([]);
    }
  }, [config, configMissing]);

  function updateQuestion(index: number, question: Question) {
    setDraftQuestions(current => current.map((q, i) => (i === index ? question : q)));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setDraftQuestions(current => {
      const next = [...current];
      const target = index + direction;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setMessage(null);
    setErrorMessage(null);
    setShowReloadAction(false);
    try {
      await saveDraft.mutateAsync({ conditionId, questions: draftQuestions });
      setMessage('Draft saved.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Draft save failed.');
    }
  }

  async function handlePublish() {
    if (!config) {
      setErrorMessage('Save a draft before publishing.');
      return;
    }

    setMessage(null);
    setErrorMessage(null);
    setShowReloadAction(false);
    let clinicalReview: ClinicalReviewMetadata | undefined;

    if (hasContraChanges(config.publishedQuestions, draftQuestions)) {
      const reviewedByName = window.prompt('Clinical reviewer name required for contraindication changes');
      if (!reviewedByName) {
        setErrorMessage('Clinical review is required before publishing contraindication changes.');
        return;
      }
      clinicalReview = {
        reviewedBy: reviewedByName,
        reviewedByName,
        reviewedAt: new Date().toISOString(),
      };
    }

    try {
      await publishForm.mutateAsync({
        conditionId,
        expectedUpdatedAt: config.updatedAt,
        clinicalReview,
      });
      setMessage('Form published.');
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'CONCURRENT_EDIT') {
        setErrorMessage('Another admin modified this form. Reload to see the latest version.');
        setShowReloadAction(true);
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : 'Publish failed.');
    }
  }

  async function handleMigrate() {
    setMessage(null);
    setErrorMessage(null);
    setShowReloadAction(false);
    try {
      const result = await migrateForms.mutateAsync();
      setMessage(`Migration complete. Seeded ${result.seeded.length}; skipped ${result.skipped.length}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Migration failed.');
    }
  }

  const isBusy = saveDraft.isPending || publishForm.isPending || migrateForms.isPending;
  const showMigrate = (formList.data?.forms ?? []).every(form => form.publishedVersion === 0);

  async function handleReloadForm() {
    setShowReloadAction(false);
    setErrorMessage(null);
    await Promise.all([
      formConfig.refetch(),
      versions.refetch(),
      formList.refetch(),
    ]);
    setMessage('Latest form loaded.');
  }

  return (
    <div className="screen form-builder-screen">
      <div className="form-builder-toolbar">
        <label className="field form-builder-condition">
          <span>Condition</span>
          <select
            className="wf-select"
            value={conditionId}
            onChange={e => {
              setConditionId(e.target.value);
              setDraftQuestions([]);
              setMessage(null);
              setErrorMessage(null);
              setShowReloadAction(false);
            }}
          >
            {conditionIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </label>
        <div className="form-builder-meta">
          <span className="badge">Version {config?.publishedVersion ?? 0}</span>
          <span className="ts-cell">{formatDate(config?.publishedAt ?? null)}</span>
        </div>
        <div className="form-builder-toolbar-actions">
          {showMigrate && (
            <button
              type="button"
              className="export-button"
              disabled={isBusy}
              onClick={handleMigrate}
            >
              Migrate hardcoded forms
            </button>
          )}
          <button
            type="button"
            className="export-button"
            disabled={isBusy}
            onClick={() => setDraftQuestions(current => [...current, emptyQuestion(current.length)])}
          >
            Add question
          </button>
          <button type="button" className="export-button" disabled={isBusy} onClick={handleSave}>
            Save draft
          </button>
          <button type="button" className="btn-primary-sm" disabled={isBusy || !config} onClick={handlePublish}>
            Publish
          </button>
        </div>
      </div>

      {message && <div className="badge status-succeeded">{message}</div>}
      {errorMessage && (
        <div className="screen-error form-builder-error-row" role="alert">
          <span>{errorMessage}</span>
          {showReloadAction && (
            <button type="button" className="export-button" onClick={handleReloadForm}>
              Reload
            </button>
          )}
        </div>
      )}
      {formConfig.isLoading && <div className="screen-empty">Loading form config...</div>}
      {configMissing && draftQuestions.length === 0 && (
        <div className="screen-empty">No form exists for this condition yet. Add a question to start a draft.</div>
      )}

      <div className="form-builder-layout">
        <div className="form-builder-main">
          {draftQuestions.map((question, index) => (
            <QuestionEditor
              key={`${question.id}-${index}`}
              question={question}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < draftQuestions.length - 1}
              onChange={next => updateQuestion(index, next)}
              onRemove={() => setDraftQuestions(current => current.filter((_, i) => i !== index))}
              onMove={direction => moveQuestion(index, direction)}
              priorQuestions={draftQuestions.slice(0, index)}
            />
          ))}
        </div>

        <aside className="form-builder-side">
          <FormPreview questions={draftQuestions} />

          <section className="panel form-builder-panel">
            <h3>Version History</h3>
            {versions.isLoading ? (
              <p>Loading versions...</p>
            ) : (versions.data?.versions ?? []).length === 0 ? (
              <p>No published versions yet.</p>
            ) : (
              <div className="form-builder-version-list">
                {(versions.data?.versions ?? []).map(version => (
                  <div key={version.version} className="form-builder-version-row">
                    <strong>v{version.version}</strong>
                    <span>{formatDate(version.publishedAt)}</span>
                    <span>{version.questionCount} questions</span>
                    <span>{version.publishedByName}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="panel form-builder-panel">
            <h3>JSON Preview</h3>
            <pre className="form-builder-json">{JSON.stringify(draftQuestions, null, 2)}</pre>
          </section>
        </aside>
      </div>
    </div>
  );
}
