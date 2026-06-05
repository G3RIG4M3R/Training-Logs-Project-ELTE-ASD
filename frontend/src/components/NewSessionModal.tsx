import { useState } from 'react';

interface NewSessionModalProps {
  onSave: (date: string, title: string) => Promise<void>;
  onClose: () => void;
}

export default function NewSessionModal({ onSave, onClose }: NewSessionModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { setError('Date is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(date, title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Training Session</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-field">
            <label>Date *</label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split('T')[0]}
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
          {error && <p className="field-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
