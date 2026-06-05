import { useState, useEffect, useCallback } from 'react';
import type { Athlete } from '../types/athlete';
import type { TrainingSession } from '../types/session';
import type { Result, ResultCreate, ResultUpdate } from '../types/result';
import * as athleteApi from '../api/athletes';
import * as sessionApi from '../api/sessions';
import * as resultsApi from '../api/results';
import { useSessionSelection } from '../hooks/useSessionQueryParam';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import NewSessionModal from '../components/NewSessionModal';
import './ResultsPage.css';

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Confirm modal ─────────────────────────────────────────────
interface ConfirmModalProps {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmModal({ message, confirmLabel = 'Confirm', onConfirm, onClose }: ConfirmModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ padding: '0 0 1rem' }}>{message}</p>
        <div className="form-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Result form modal (add + edit) ────────────────────────────
interface ResultFormModalProps {
  athletes: Athlete[];
  sessionId: number;
  initial?: Result;
  onSave: (data: ResultCreate | (ResultUpdate & { id: number })) => Promise<void>;
  onClose: () => void;
}

function ResultFormModal({ athletes, sessionId, initial, onSave, onClose }: ResultFormModalProps) {
  const isEdit = !!initial;
  const [athleteId, setAthleteId] = useState<number>(initial?.athleteId ?? athletes[0]?.id ?? 0);
  const [eventName, setEventName] = useState(initial?.eventName ?? '');
  const [value, setValue] = useState(initial ? String(initial.value) : '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [resultDate, setResultDate] = useState(initial?.resultDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!athleteId) e.athleteId = 'Required';
    if (!eventName.trim()) e.eventName = 'Required';
    if (value === '' || isNaN(Number(value)) || Number(value) < 0) e.value = 'Must be a non-negative number';
    if (!unit.trim()) e.unit = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      if (isEdit && initial) {
        await onSave({
          id: initial.id,
          eventName: eventName.trim(),
          value: Number(value),
          unit: unit.trim(),
          resultDate: resultDate || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await onSave({
          athleteId,
          sessionId,
          eventName: eventName.trim(),
          value: Number(value),
          unit: unit.trim(),
          resultDate: resultDate || undefined,
          notes: notes.trim() || undefined,
        });
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to save result');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Result' : 'Add Result'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <p className="form-section-label">Athlete &amp; Event</p>
          <div className="form-row">
            <div className={`form-field ${errors.athleteId ? 'has-error' : ''}`}>
              <label>Athlete *</label>
              <select value={athleteId} onChange={e => setAthleteId(Number(e.target.value))} disabled={isEdit}>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.athleteId && <span className="field-error">{errors.athleteId}</span>}
            </div>
            <div className={`form-field ${errors.eventName ? 'has-error' : ''}`}>
              <label>Event *</label>
              <input
                value={eventName}
                maxLength={120}
                placeholder="e.g. 100m sprint"
                onChange={e => { setEventName(e.target.value); setErrors(x => ({ ...x, eventName: '' })); }}
              />
              {errors.eventName && <span className="field-error">{errors.eventName}</span>}
            </div>
          </div>

          <p className="form-section-label">Performance</p>
          <div className="form-row">
            <div className={`form-field ${errors.value ? 'has-error' : ''}`}>
              <label>Value *</label>
              <input
                type="number"
                step="any"
                min="0"
                value={value}
                placeholder="e.g. 12.34"
                onChange={e => { setValue(e.target.value); setErrors(x => ({ ...x, value: '' })); }}
              />
              {errors.value && <span className="field-error">{errors.value}</span>}
            </div>
            <div className={`form-field ${errors.unit ? 'has-error' : ''}`}>
              <label>Unit *</label>
              <input
                value={unit}
                maxLength={24}
                placeholder="e.g. sec, m, kg"
                onChange={e => { setUnit(e.target.value); setErrors(x => ({ ...x, unit: '' })); }}
              />
              {errors.unit && <span className="field-error">{errors.unit}</span>}
            </div>
            <div className="form-field">
              <label>Date (optional)</label>
              <input type="date" value={resultDate} onChange={e => setResultDate(e.target.value)} />
            </div>
          </div>

          <p className="form-section-label">Notes</p>
          <div className="form-row">
            <div className="form-field form-field--full">
              <textarea value={notes} rows={2} placeholder="Any relevant notes…" onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {apiError && <p className="field-error">{apiError}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ResultsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const { selectedId, selectSession } = useSessionSelection(sessions);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [resultsError, setResultsError] = useState('');
  const [sessionActionError, setSessionActionError] = useState('');

  const [showNewSession, setShowNewSession] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null);

  const [showAddResult, setShowAddResult] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [deletingResultId, setDeletingResultId] = useState<number | null>(null);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError('');
    try {
      const data = await sessionApi.listSessions();
      setSessions(data);
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadResults = useCallback(async (sessionId: number) => {
    setResultsLoading(true);
    setResultsError('');
    try {
      const data = await resultsApi.getSessionResults(sessionId);
      setResults(data);
    } catch (err) {
      setResultsError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setResultsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    athleteApi.listAthletes().then(setAthletes).catch(() => {});
  }, [loadSessions]);

  useEffect(() => {
    if (selectedId !== null) loadResults(selectedId);
  }, [selectedId, loadResults]);

  // ── Session CRUD ──────────────────────────────────────────────
  const handleCreateSession = async (date: string, title: string, notes: string) => {
    const session = await sessionApi.createSession({
      date,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSessions(prev => [session, ...prev]);
    selectSession(session.id);
    setShowNewSession(false);
  };

  const handleUpdateSession = async (date: string, title: string, notes: string) => {
    if (!editingSession) return;
    setSessionActionError('');
    const updated = await sessionApi.updateSession(editingSession.id, {
      date,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingSession(null);
  };

  const handleDeleteSession = async () => {
    if (deletingSessionId === null) return;
    setSessionActionError('');
    try {
      await sessionApi.deleteSession(deletingSessionId);
      const remaining = sessions.filter(s => s.id !== deletingSessionId);
      setSessions(remaining);
      setDeletingSessionId(null);
      if (selectedId === deletingSessionId) {
        setResults([]);
      }
    } catch (err) {
      setDeletingSessionId(null);
      setSessionActionError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  // ── Result CRUD ───────────────────────────────────────────────
  const handleSaveResult = async (data: ResultCreate | (ResultUpdate & { id: number })) => {
    if ('id' in data) {
      const { id, ...update } = data;
      await resultsApi.updateResult(id, update);
    } else {
      await resultsApi.createResult(data);
    }
    if (selectedId !== null) await loadResults(selectedId);
    setShowAddResult(false);
    setEditingResult(null);
  };

  const handleDeleteResult = async () => {
    if (deletingResultId === null) return;
    await resultsApi.deleteResult(deletingResultId);
    setResults(prev => prev.filter(r => r.id !== deletingResultId));
    setDeletingResultId(null);
  };

  const exportCsv = () => {
    if (selectedId === null || results.length === 0) return;
    const session = sessions.find(s => s.id === selectedId);
    const headers = ['Athlete', 'Event', 'Value', 'Unit', 'Result Date', 'Notes'];
    const rows = results.map(r => [
      `"${r.athleteName}"`, `"${r.eventName}"`,
      r.value, r.unit, r.resultDate, `"${r.notes ?? ''}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `results_${session?.date ?? selectedId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedSession = sessions.find(s => s.id === selectedId);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-subtitle">Record and review athletic performance data</p>
        </div>
        <div className="page-header-actions">
          {selectedId !== null && results.length > 0 && (
            <button className="btn btn--secondary" onClick={exportCsv}>↓ Export CSV</button>
          )}
          <button className="btn btn--secondary" onClick={() => setShowNewSession(true)}>+ New Session</button>
          {selectedId !== null && athletes.length > 0 && (
            <button className="btn btn--primary" onClick={() => setShowAddResult(true)}>+ Add Result</button>
          )}
        </div>
      </div>

      {sessionsLoading ? (
        <LoadingSpinner />
      ) : sessionsError ? (
        <ErrorMessage message={sessionsError} onRetry={loadSessions} />
      ) : sessions.length === 0 ? (
        <EmptyState
          message="No training sessions yet. Create the first one."
          action={{ label: '+ Create Session', onClick: () => setShowNewSession(true) }}
        />
      ) : (
        <>
          {/* Session selector bar */}
          <div className="session-bar">
            <div className="session-selector">
              <label className="session-label">Session</label>
              <select
                className="filter-select session-select"
                value={selectedId ?? ''}
                onChange={e => selectSession(Number(e.target.value))}
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.date)}{s.title ? ` — ${s.title}` : ''}
                  </option>
                ))}
              </select>
              {selectedSession && (
                <>
                  <button
                    className="btn btn--icon"
                    title="Edit session"
                    onClick={() => { setSessionActionError(''); setEditingSession(selectedSession); }}
                  >✏️</button>
                  <button
                    className="btn btn--icon btn--icon-danger"
                    title="Delete session"
                    onClick={() => { setSessionActionError(''); setDeletingSessionId(selectedSession.id); }}
                  >🗑️</button>
                </>
              )}
            </div>
            {selectedId !== null && !resultsLoading && (
              <span className="filter-count">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {sessionActionError && (
            <ErrorMessage message={sessionActionError} onRetry={() => setSessionActionError('')} />
          )}

          {resultsLoading ? (
            <LoadingSpinner />
          ) : resultsError ? (
            <ErrorMessage
              message={resultsError}
              onRetry={() => selectedId !== null && loadResults(selectedId)}
            />
          ) : results.length === 0 ? (
            <EmptyState
              message="No results recorded for this session yet."
              action={athletes.length > 0
                ? { label: '+ Add First Result', onClick: () => setShowAddResult(true) }
                : undefined}
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Athlete</th>
                    <th>Event</th>
                    <th>Result</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="table-row">
                      <td>{r.athleteName}</td>
                      <td>{r.eventName}</td>
                      <td>
                        <span className="result-value">
                          {r.value} <span className="result-unit">{r.unit}</span>
                        </span>
                      </td>
                      <td>{formatDate(r.resultDate)}</td>
                      <td>{r.notes || <span className="text-muted">—</span>}</td>
                      <td className="td-actions">
                        <button
                          className="btn btn--icon"
                          title="Edit result"
                          onClick={() => setEditingResult(r)}
                        >✏️</button>
                        <button
                          className="btn btn--icon btn--icon-danger"
                          title="Delete result"
                          onClick={() => setDeletingResultId(r.id)}
                        >🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showNewSession && (
        <NewSessionModal
          onSave={handleCreateSession}
          onClose={() => setShowNewSession(false)}
        />
      )}
      {editingSession && (
        <NewSessionModal
          initial={editingSession}
          onSave={handleUpdateSession}
          onClose={() => setEditingSession(null)}
        />
      )}
      {deletingSessionId !== null && (
        <ConfirmModal
          message={`Delete session "${selectedSession?.title || formatDate(selectedSession?.date ?? '')}"? This is only possible if it has no attendance or results.`}
          confirmLabel="Delete Session"
          onConfirm={handleDeleteSession}
          onClose={() => setDeletingSessionId(null)}
        />
      )}
      {(showAddResult || editingResult) && selectedId !== null && (
        <ResultFormModal
          athletes={athletes}
          sessionId={selectedId}
          initial={editingResult ?? undefined}
          onSave={handleSaveResult}
          onClose={() => { setShowAddResult(false); setEditingResult(null); }}
        />
      )}
      {deletingResultId !== null && (
        <ConfirmModal
          message="Delete this result? This action cannot be undone."
          confirmLabel="Delete Result"
          onConfirm={handleDeleteResult}
          onClose={() => setDeletingResultId(null)}
        />
      )}
    </div>
  );
}
