import type { Athlete } from '../types/athlete';
import type { AttendanceRecord, AttendanceStatus } from '../types/attendance';

interface AttendanceCardProps {
  athlete: Athlete;
  record?: AttendanceRecord;
  saving: boolean;
  initials: string;
  onToggleStatus: (status: AttendanceStatus) => void;
  onEditNotes: () => void;
  onClear: () => void;
}

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'excused'];

export default function AttendanceCard({
  athlete,
  record,
  saving,
  initials,
  onToggleStatus,
  onEditNotes,
  onClear,
}: AttendanceCardProps) {
  return (
    <article className="mobile-card">
      <div className="mobile-card-header">
        <div className={`avatar avatar--${athlete.sex}`}>{initials}</div>
        <span className="athlete-attendance-name mobile-card-title">{athlete.name}</span>
      </div>

      <div className={`status-toggles${saving ? ' status-toggles--saving' : ''}`}>
        {STATUSES.map(status => (
          <button
            key={status}
            type="button"
            className={`status-btn status-btn--${status}${record?.status === status ? ' status-btn--active' : ''}`}
            onClick={() => onToggleStatus(status)}
            disabled={saving}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="mobile-card-row">
        <div className="mobile-card-field mobile-card-field--grow">
          <label>Notes</label>
          {record?.notes
            ? <span className="mobile-card-notes" title={record.notes}>{record.notes}</span>
            : <span className="text-muted">—</span>}
        </div>
        {record && (
          <div className="mobile-card-actions--icons">
            <button type="button" className="btn btn--icon" title="Edit notes" onClick={onEditNotes}>✏️</button>
            <button type="button" className="btn btn--icon btn--icon-danger" title="Clear attendance" onClick={onClear}>✕</button>
          </div>
        )}
      </div>
    </article>
  );
}
