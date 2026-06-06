import { useState } from 'react';
import type { Athlete, ClothingSize, Sex } from '../types/athlete';

const SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface AthleteFormModalProps {
  initial: Omit<Athlete, 'id'>;
  title: string;
  onSave: (data: Omit<Athlete, 'id'>) => Promise<void>;
  onClose: () => void;
}

export default function AthleteFormModal({ initial, title, onSave, onClose }: AthleteFormModalProps) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Athlete, 'id'>, string>>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = <K extends keyof typeof form>(key: K, val: typeof form[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim())   e.name = 'Required';
    if (!form.dateOfBirth)   e.dateOfBirth = 'Required';
    if (form.height < 100 || form.height > 250) e.height = '100–250 cm';
    if (form.weight < 30  || form.weight > 200) e.weight = '30–200 kg';
    if (form.shoeSize < 30 || form.shoeSize > 55) e.shoeSize = '30–55 EU';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      await onSave(form);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to save athlete');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <p className="form-section-label">Identity</p>
          <div className="form-row">
            <div className={`form-field form-field--full ${errors.name ? 'has-error' : ''}`}>
              <label>Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Kovács Bence" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-field ${errors.dateOfBirth ? 'has-error' : ''}`}>
              <label>Date of Birth *</label>
              <input
                type="date"
                value={form.dateOfBirth}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => set('dateOfBirth', e.target.value)}
              />
              {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth}</span>}
            </div>
            <div className="form-field">
              <label>Sex *</label>
              <select value={form.sex} onChange={e => set('sex', e.target.value as Sex)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <p className="form-section-label">Physical Stats</p>
          <div className="form-row">
            <div className={`form-field ${errors.height ? 'has-error' : ''}`}>
              <label>Height (cm) *</label>
              <input type="number" value={form.height} min={100} max={250} onChange={e => set('height', +e.target.value)} />
              {errors.height && <span className="field-error">{errors.height}</span>}
            </div>
            <div className={`form-field ${errors.weight ? 'has-error' : ''}`}>
              <label>Weight (kg) *</label>
              <input type="number" value={form.weight} min={30} max={200} onChange={e => set('weight', +e.target.value)} />
              {errors.weight && <span className="field-error">{errors.weight}</span>}
            </div>
            <div className={`form-field ${errors.shoeSize ? 'has-error' : ''}`}>
              <label>Shoe Size (EU) *</label>
              <input type="number" value={form.shoeSize} min={30} max={55} onChange={e => set('shoeSize', +e.target.value)} />
              {errors.shoeSize && <span className="field-error">{errors.shoeSize}</span>}
            </div>
          </div>

          <p className="form-section-label">Gear Sizes</p>
          <div className="form-row">
            <div className="form-field">
              <label>Shirt</label>
              <div className="size-picker">
                {SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`size-btn ${form.shirtSize === s ? 'size-btn--active' : ''}`}
                    onClick={() => set('shirtSize', s)}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>Shorts</label>
              <div className="size-picker">
                {SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`size-btn ${form.shortSize === s ? 'size-btn--active' : ''}`}
                    onClick={() => set('shortSize', s)}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>

          <p className="form-section-label">Notes</p>
          <div className="form-row">
            <div className="form-field form-field--full">
              <textarea
                value={form.notes ?? ''}
                onChange={e => set('notes', e.target.value)}
                rows={2}
                placeholder="Any relevant notes…"
              />
            </div>
          </div>

          {apiError && <p className="field-error">{apiError}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Athlete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
