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

  const handleCreateSession = async (date: string, title: string) => {
    const session = await sessionApi.createSession({ date, title: title.trim() || undefined });
    setSessions(prev => [session, ...prev]);
    setSelectedId(session.id);
    setShowNewSession(false);
  };

  const handleToggleStatus = async (athlete: Athlete, status: AttendanceStatus) => {
    if (selectedId === null) return;
    const existing = attendance.find(r => r.athleteId === athlete.id);
    if (existing?.status === status) return;

    setSavingIds(prev => new Set(prev).add(athlete.id));
    try {
      if (existing) {
        const updated = await attendanceApi.updateAttendance(existing.id, { status });
        setAttendance(prev => prev.map(r => r.id === existing.id ? updated : r));
      } else {
        const created = await attendanceApi.createAttendance({ athleteId: athlete.id, sessionId: selectedId, status });
        setAttendance(prev => [...prev, created]);
      }
    } catch (err) {
      setAttendanceError(err instanceof Error ? err.message : 'Failed to save attendance');
    } finally {
      setSavingIds(prev => { const s = new Set(prev); s.delete(athlete.id); return s; });
    }
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
          {/* Session selector + stats */}
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
            {selectedId !== null && !attendanceLoading && (
              <div className="attendance-stats">
                <span className="stat-pill stat-pill--present">{presentCount} present</span>
                <span className="stat-pill stat-pill--absent">{absentCount} absent</span>
                <span className="stat-pill stat-pill--excused">{excusedCount} excused</span>
                {notRecorded > 0 && <span className="stat-pill">{notRecorded} not recorded</span>}
              </div>
            )}
          </div>

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
                          {rec?.notes || <span className="text-muted">—</span>}
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

      {showNewSession && (
        <NewSessionModal
          onSave={handleCreateSession}
          onClose={() => setShowNewSession(false)}
        />
      )}
    </div>
  );
}
