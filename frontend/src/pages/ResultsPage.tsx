import { useState, useEffect, useCallback } from 'react';
import type { Athlete } from '../types/athlete';
import type { TrainingSession } from '../types/session';
import type { Result, ResultCreate } from '../types/result';
import * as athleteApi from '../api/athletes';
import * as sessionApi from '../api/sessions';
import * as resultsApi from '../api/results';
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

// ── Add Result Modal ──────────────────────────────────────────
interface AddResultModalProps {
  athletes: Athlete[];
  sessionId: number;
  onSave: (data: ResultCreate) => Promise<void>;
  onClose: () => void;
}

function AddResultModal({ athletes, sessionId, onSave, onClose }: AddResultModalProps) {
  const [athleteId, setAthleteId] = useState<number>(athletes[0]?.id ?? 0);
  const [eventName, setEventName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [notes, setNotes] = useState('');
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
      await onSave({
        athleteId,
        sessionId,
        eventName: eventName.trim(),
        value: Number(value),
        unit: unit.trim(),
        resultDate: resultDate || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to save result');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Result</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <p className="form-section-label">Athlete &amp; Event</p>
          <div className="form-row">
            <div className={`form-field ${errors.athleteId ? 'has-error' : ''}`}>
              <label>Athlete *</label>
              <select value={athleteId} onChange={e => setAthleteId(Number(e.target.value))}>
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
              <input
                type="date"
                value={resultDate}
                onChange={e => setResultDate(e.target.value)}
              />
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
              {saving ? 'Saving…' : 'Save Result'}
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [resultsError, setResultsError] = useState('');
  const [showNewSession, setShowNewSession] = useState(false);
  const [showAddResult, setShowAddResult] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError('');
    try {
      const data = await sessionApi.listSessions();
      setSessions(data);
      if (data.length > 0) {
        setSelectedId(prev => prev ?? data[0].id);
      }
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

  const handleCreateSession = async (date: string, title: string) => {
    const session = await sessionApi.createSession({ date, title: title.trim() || undefined });
    setSessions(prev => [session, ...prev]);
    setSelectedId(session.id);
    setShowNewSession(false);
  };

  const handleAddResult = async (data: ResultCreate) => {
    await resultsApi.createResult(data);
    if (selectedId !== null) await loadResults(selectedId);
    setShowAddResult(false);
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
          {/* Session selector */}
          <div className="session-bar">
            <div className="session-selector">
              <label className="session-label">Session</label>
              <select
                className="filter-select session-select"
                value={selectedId ?? ''}
                onChange={e => setSelectedId(Number(e.target.value))}
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {formatDate(s.date)}{s.title ? ` — ${s.title}` : ''}
                  </option>
                ))}
              </select>
            </div>
            {selectedId !== null && !resultsLoading && (
              <span className="filter-count">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showNewSession && (
        <NewSessionModal
          onSave={handleCreateSession}
          onClose={() => setShowNewSession(false)}
        />
      )}
      {showAddResult && selectedId !== null && (
        <AddResultModal
          athletes={athletes}
          sessionId={selectedId}
          onSave={handleAddResult}
          onClose={() => setShowAddResult(false)}
        />
      )}
    </div>
  );
}
