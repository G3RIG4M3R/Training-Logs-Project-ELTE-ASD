import { useState, useEffect, useCallback } from 'react';
import { getAthleteProfile } from '../api/athletes';
import type { AthleteProfile } from '../types/athlete';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './ProfilePage.css';

function calcAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface ProfilePageProps {
  athleteId: number;
  onBack: () => void;
}

export default function ProfilePage({ athleteId, onBack }: ProfilePageProps) {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getAthleteProfile(athleteId)
      .then(setProfile)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [athleteId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="page">
        <button className="btn btn--secondary profile-back" onClick={onBack}>← Back</button>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <button className="btn btn--secondary profile-back" onClick={onBack}>← Back</button>
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );
  }

  if (!profile) return null;

  const s = profile.attendanceSummary;
  const attendanceRate = s.totalSessions > 0
    ? Math.round((s.present / s.totalSessions) * 100)
    : null;

  return (
    <div className="page">
      {/* Back button */}
      <button className="btn btn--secondary profile-back" onClick={onBack}>← Back to Athletes</button>

      {/* Profile header */}
      <div className="profile-header">
        <div className={`avatar avatar--${profile.sex} avatar--lg`}>
          {initials(profile.name)}
        </div>
        <div className="profile-header-info">
          <h1 className="profile-name">{profile.name}</h1>
          <div className="profile-meta">
            <span className="capitalize">{profile.sex}</span>
            <span className="meta-dot">·</span>
            <span>{calcAge(profile.dateOfBirth)} years old</span>
            <span className="meta-dot">·</span>
            <span>Born {formatDate(profile.dateOfBirth)}</span>
          </div>
          {profile.notes && <p className="profile-notes">{profile.notes}</p>}
        </div>
      </div>

      {/* Cards row */}
      <div className="profile-cards">
        {/* Physical stats */}
        <div className="profile-card">
          <h3 className="card-title">Physical Stats</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Height</span>
              <span className="stat-value">{profile.height} cm</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Weight</span>
              <span className="stat-value">{profile.weight} kg</span>
            </div>
          </div>
        </div>

        {/* Gear sizes */}
        <div className="profile-card">
          <h3 className="card-title">Gear Sizes</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Shirt</span>
              <span className="size-tag">{profile.shirtSize}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Shorts</span>
              <span className="size-tag">{profile.shortSize}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Shoe (EU)</span>
              <span className="stat-value">{profile.shoeSize}</span>
            </div>
          </div>
        </div>

        {/* Attendance summary */}
        <div className="profile-card">
          <h3 className="card-title">Attendance</h3>
          {s.totalSessions === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>No sessions recorded yet.</p>
          ) : (
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-label">Sessions</span>
                <span className="stat-value">{s.totalSessions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Present</span>
                <span className="stat-value stat-value--present">{s.present}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Absent</span>
                <span className="stat-value stat-value--absent">{s.absent}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Excused</span>
                <span className="stat-value stat-value--excused">{s.excused}</span>
              </div>
              {attendanceRate !== null && (
                <div className="stat-item stat-item--wide">
                  <span className="stat-label">Attendance rate</span>
                  <span className="stat-value">{attendanceRate}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent results */}
      <div>
        <h2 className="section-title">Recent Results</h2>
        {profile.recentResults.length === 0 ? (
          <div className="empty"><p>No results recorded yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Result</th>
                  <th>Result Date</th>
                  <th>Session</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {profile.recentResults.map(r => (
                  <tr key={r.id} className="table-row">
                    <td>{r.eventName}</td>
                    <td>
                      <span className="result-value">
                        {r.value} <span className="result-unit">{r.unit}</span>
                      </span>
                    </td>
                    <td>{formatDate(r.resultDate)}</td>
                    <td>{r.sessionDate ? formatDate(r.sessionDate) : <span className="text-muted">—</span>}</td>
                    <td>{r.notes || <span className="text-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
