import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAthleteProfile, updateAthlete } from '../api/athletes';
import type { Athlete, AthleteProfile } from '../types/athlete';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import AthleteFormModal from '../components/AthleteFormModal';
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

function parseAthleteId(param: string | undefined): number | null {
  if (!param) return null;
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default function ProfilePage() {
  const { athleteId: athleteIdParam } = useParams();
  const navigate = useNavigate();
  const athleteId = parseAthleteId(athleteIdParam);

  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  const goBack = () => navigate('/athletes');

  const load = useCallback(() => {
    if (athleteId === null) return;
    setLoading(true);
    setError('');
    getAthleteProfile(athleteId)
      .then(setProfile)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [athleteId]);

  useEffect(() => {
    if (athleteId === null) {
      navigate('/athletes', { replace: true });
      return;
    }
    load();
  }, [athleteId, load, navigate]);

  const handleSaveEdit = async (data: Omit<Athlete, 'id'>) => {
    if (athleteId === null) return;
    await updateAthlete(athleteId, {
      name: data.name,
      dateOfBirth: data.dateOfBirth,
      sex: data.sex,
      height: data.height,
      weight: data.weight,
      shirtSize: data.shirtSize,
      shortSize: data.shortSize,
      shoeSize: data.shoeSize,
      notes: data.notes?.trim() || undefined,
    });
    load();
    setEditing(false);
  };

  if (athleteId === null) {
    return null;
  }

  if (loading) {
    return (
      <div className="page">
        <button className="btn btn--secondary" onClick={goBack} style={{ marginBottom: '1rem' }}>← Back</button>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <button className="btn btn--secondary" onClick={goBack} style={{ marginBottom: '1rem' }}>← Back</button>
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
      <div className="profile-back-bar">
        <button className="btn btn--secondary" onClick={goBack}>← Back to Athletes</button>
        <button className="btn btn--primary" onClick={() => setEditing(true)}>Edit Athlete</button>
      </div>

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

      <div className="profile-cards">
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

      {editing && (
        <AthleteFormModal
          title="Edit Athlete"
          initial={{
            name: profile.name,
            dateOfBirth: profile.dateOfBirth,
            sex: profile.sex,
            height: profile.height,
            weight: profile.weight,
            shirtSize: profile.shirtSize,
            shortSize: profile.shortSize,
            shoeSize: profile.shoeSize,
            notes: profile.notes ?? '',
          }}
          onSave={handleSaveEdit}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
