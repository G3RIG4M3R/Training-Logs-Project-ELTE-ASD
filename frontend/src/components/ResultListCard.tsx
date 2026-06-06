interface ResultListCardProps {
  athleteName?: string;
  eventName: string;
  value: number;
  unit: string;
  resultDate: string;
  sessionDate?: string | null;
  notes?: string | null;
  formatDate: (dateStr: string) => string;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ResultListCard({
  athleteName,
  eventName,
  value,
  unit,
  resultDate,
  sessionDate,
  notes,
  formatDate,
  readOnly = false,
  onEdit,
  onDelete,
}: ResultListCardProps) {
  return (
    <article className="mobile-card">
      <div className="mobile-card-header">
        <div className="mobile-card-field--grow">
          {athleteName && <div className="mobile-card-title">{athleteName}</div>}
          <div className="mobile-card-subtitle">{eventName}</div>
        </div>
      </div>

      <div className="mobile-card-highlight">
        {value} <span className="result-unit">{unit}</span>
      </div>

      <div className="mobile-card-meta">
        <div>Date: {formatDate(resultDate)}</div>
        {sessionDate !== undefined && (
          <div>Session: {sessionDate ? formatDate(sessionDate) : '—'}</div>
        )}
        {notes && <div className="mobile-card-meta-note">{notes}</div>}
      </div>

      {!readOnly && onEdit && onDelete && (
        <div className="mobile-card-actions">
          <button type="button" className="action-btn action-btn--edit" onClick={onEdit}>Edit</button>
          <button type="button" className="action-btn action-btn--delete" onClick={onDelete}>Delete</button>
        </div>
      )}
    </article>
  );
}
