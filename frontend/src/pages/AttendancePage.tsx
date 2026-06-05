import { useState, useEffect, useCallback } from 'react';
import type { Athlete } from '../types/athlete';
import type { TrainingSession } from '../types/session';
import type { AttendanceRecord, AttendanceStatus } from '../types/attendance';
import * as athleteApi from '../api/athletes';
import * as sessionApi from '../api/sessions';
import * as attendanceApi from '../api/attendance';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import NewSessionModal from '../components/NewSessionModal';
import './AttendancePage.css';

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

// ── Notes edit modal ──────────────────────────────────────────
interface NotesModalProps {
  record: AttendanceRecord;
  onSave: (notes: string) => Promise<void>;
  onClose: () => void;
}

function NotesModal({ record, onSave, onClose }: NotesModalProps) {
  const [notes, setNotes] = useState(record.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Notes — {record.athleteName}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label>Notes</label>
            <textarea
              value={notes}
              rows={3}
              maxLength={1000}
              placeholder="Notes for this attendance record…"
              onChange={e => setNotes(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm modal ──────────────────────────────────────────────
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

// ── Main Page ─────────────────────────────────────────────────
export default function AttendancePage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

  const [showNewSession, setShowNewSession] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null);
  const [sessionActionError, setSessionActionError] = useState('');

  const [editingNotesRecord, setEditingNotesRecord] = useState<AttendanceRecord | null>(null);
  const [clearingRecord, setClearingRecord] = useState<AttendanceRecord | null>(null);

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

  const loadAttendance = useCallback(async (sessionId: number) => {
    setAttendanceLoading(true);
    setAttendanceError('');
    try {
      const data = await attendanceApi.getSessionAttendance(sessionId);
      setAttendance(data);
    } catch (err) {
      setAttendanceError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setAttendanceLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    athleteApi.listAthletes().then(setAthletes).catch(() => {});
  }, [loadSessions]);

  useEffect(() => {
    if (selectedId !== null) loadAttendance(selectedId);
  }, [selectedId, loadAttendance]);

  // ── Session CRUD ──────────────────────────────────────────────
  const handleCreateSession = async (date: string, title: string, notes: string) => {
    const session = await sessionApi.createSession({
      date,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSessions(prev => [session, ...prev]);
    setSelectedId(session.id);
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
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
        setAttendance([]);
      }
    } catch (err) {
      setDeletingSessionId(null);
      setSessionActionError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  // ── Attendance CRUD ───────────────────────────────────────────
  const handleToggleStatus = async (athlete: Athlete, status: AttendanceStatus) => {
    if (selectedId === null) return;
    const existing = attendance.find(r => r.athleteId === athlete.id);
    if (existing?.status === status) return;

    setSavingIds(prev => new Set(prev).add(athlete.id));
    try {
      if (existing) {
        // Pass existing notes to avoid wiping them on status toggle
        const updated = await attendanceApi.updateAttendance(existing.id, {
          status,
          notes: existing.notes,
        });
        setAttendance(prev => prev.map(r => r.id === existing.id ? updated : r));
      } else {
        const created = await attendanceApi.createAttendance({
          athleteId: athlete.id,
          sessionId: selectedId,
          status,
        });
        setAttendance(prev => [...prev, created]);
      }
    } catch (err) {
      setAttendanceError(err instanceof Error ? err.message : 'Failed to save attendance');
    } finally {
      setSavingIds(prev => { const s = new Set(prev); s.delete(athlete.id); return s; });
    }
  };

  const handleSaveNotes = async (notes: string) => {
    if (!editingNotesRecord) return;
    const updated = await attendanceApi.updateAttendance(editingNotesRecord.id, {
      status: editingNotesRecord.status,
      notes: notes.trim() || undefined,
    });
    setAttendance(prev => prev.map(r => r.id === updated.id ? updated : r));
    setEditingNotesRecord(null);
  };

  const handleClearRecord = async () => {
    if (!clearingRecord) return;
    await attendanceApi.deleteAttendance(clearingRecord.id);
    setAttendance(prev => prev.filter(r => r.id !== clearingRecord.id));
    setClearingRecord(null);
  };

  const exportCsv = () => {
    if (selectedId === null) return;
    const session = sessions.find(s => s.id === selectedId);
    const headers = ['Name', 'Status', 'Notes'];
    const rows = athletes.map(a => {
      const rec = attendance.find(r => r.athleteId === a.id);
      return [`"${a.name}"`, rec?.status ?? 'not recorded', `"${rec?.notes ?? ''}"`];
    });
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${session?.date ?? selectedId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const presentCount = attendance.filter(r => r.status === 'present').length;
  const absentCount  = attendance.filter(r => r.status === 'absent').length;
  const excusedCount = attendance.filter(r => r.status === 'excused').length;
  const notRecorded  = athletes.length - attendance.length;

  const selectedSession = sessions.find(s => s.id === selectedId);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track who attended each training session</p>
        </div>
        <div className="page-header-actions">
          {selectedId !== null && athletes.length > 0 && (
            <button className="btn btn--secondary" onClick={exportCsv}>↓ Export CSV</button>
          )}
          <button className="btn btn--primary" onClick={() => setShowNewSession(true)}>+ New Session</button>
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
                onChange={e => setSelectedId(Number(e.target.value))}
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
            {selectedId !== null && !attendanceLoading && (
              <div className="attendance-stats">
                <span className="stat-pill stat-pill--present">{presentCount} present</span>
                <span className="stat-pill stat-pill--absent">{absentCount} absent</span>
                <span className="stat-pill stat-pill--excused">{excusedCount} excused</span>
                {notRecorded > 0 && <span className="stat-pill">{notRecorded} not recorded</span>}
              </div>
            )}
          </div>

          {sessionActionError && (
            <ErrorMessage message={sessionActionError} onRetry={() => setSessionActionError('')} />
          )}

          {/* Attendance error */}
          {attendanceError && (
            <ErrorMessage
              message={attendanceError}
              onRetry={() => selectedId !== null && loadAttendance(selectedId)}
            />
          )}

          {/* Attendance table */}
          {attendanceLoading ? (
            <LoadingSpinner />
          ) : athletes.length === 0 ? (
            <EmptyState message="No athletes found. Add athletes in the Athletes tab first." />
          ) : (
            <div className="table-wrap">
              <table className="table attendance-table">
                <thead>
                  <tr>
                    <th>Athlete</th>
                    <th>Status</th>
                    <th className="th-notes">Notes</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map(athlete => {
                    const rec = attendance.find(r => r.athleteId === athlete.id);
                    const saving = savingIds.has(athlete.id);
                    return (
                      <tr key={athlete.id} className="table-row">
                        <td>
                          <div className="athlete-attendance-cell">
                            <div className={`avatar avatar--${athlete.sex}`}>
                              {initials(athlete.name)}
                            </div>
                            <span className="athlete-attendance-name">{athlete.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className={`status-toggles${saving ? ' status-toggles--saving' : ''}`}>
                            {(['present', 'absent', 'excused'] as AttendanceStatus[]).map(s => (
                              <button
                                key={s}
                                className={`status-btn status-btn--${s}${rec?.status === s ? ' status-btn--active' : ''}`}
                                onClick={() => handleToggleStatus(athlete, s)}
                                disabled={saving}
                                title={s.charAt(0).toUpperCase() + s.slice(1)}
                              >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="td-notes">
                          {rec?.notes
                            ? <span className="notes-text" title={rec.notes}>{rec.notes}</span>
                            : <span className="text-muted">—</span>
                          }
                        </td>
                        <td className="td-actions">
                          {rec && (
                            <>
                              <button
                                className="btn btn--icon"
                                title="Edit notes"
                                onClick={() => setEditingNotesRecord(rec)}
                              >✏️</button>
                              <button
                                className="btn btn--icon btn--icon-danger"
                                title="Clear attendance"
                                onClick={() => setClearingRecord(rec)}
                              >✕</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
      {editingNotesRecord && (
        <NotesModal
          record={editingNotesRecord}
          onSave={handleSaveNotes}
          onClose={() => setEditingNotesRecord(null)}
        />
      )}
      {clearingRecord && (
        <ConfirmModal
          message={`Clear attendance record for ${clearingRecord.athleteName}?`}
          confirmLabel="Clear Record"
          onConfirm={handleClearRecord}
          onClose={() => setClearingRecord(null)}
        />
      )}
    </div>
  );
}
