import { useState } from 'react';
import type { TrainingSession } from '../types/session';

interface NewSessionModalProps {
  /** When provided the modal opens in edit mode pre-populated with these values. */
  initial?: TrainingSession;
  onSave: (date: string, title: string, notes: string) => Promise<void>;
  onClose: () => void;
}

export default function NewSessionModal({ initial, onSave, onClose }: NewSessionModalProps) {
  const isEdit = !!initial;
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { setError('Date is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(date, title, notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Session' : 'New Training Session'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Title (optional)</label>
            <input
              type="text"
              value={title}
              placeholder="e.g. Morning training"
              maxLength={120}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              rows={2}
              maxLength={1000}
              placeholder="Any session notes…"
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
