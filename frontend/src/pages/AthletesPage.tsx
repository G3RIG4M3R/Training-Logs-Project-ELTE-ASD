import { useState } from 'react';
import type { Athlete } from '../types/athlete';
import './AthletesPage.css';

// ── Helpers ──────────────────────────────────────────────────
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

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

// ── Mock Data ─────────────────────────────────────────────────
const MOCK_ATHLETES: Athlete[] = [
  { id: 1, name: 'Kovács Bence',  dateOfBirth: '2005-03-14', sex: 'male',   height: 182, weight: 74, shirtSize: 'L',  shortSize: 'L',  shoeSize: 43, notes: 'Sprinter' },
  { id: 2, name: 'Nagy Eszter',   dateOfBirth: '2006-07-22', sex: 'female', height: 168, weight: 58, shirtSize: 'S',  shortSize: 'S',  shoeSize: 38 },
  { id: 3, name: 'Tóth Márk',     dateOfBirth: '2004-11-05', sex: 'male',   height: 175, weight: 68, shirtSize: 'M',  shortSize: 'M',  shoeSize: 42, notes: 'Middle distance' },
  { id: 4, name: 'Szabó Anna',    dateOfBirth: '2007-02-18', sex: 'female', height: 163, weight: 52, shirtSize: 'XS', shortSize: 'XS', shoeSize: 37 },
  { id: 5, name: 'Horváth Péter', dateOfBirth: '2003-08-30', sex: 'male',   height: 188, weight: 82, shirtSize: 'XL', shortSize: 'XL', shoeSize: 45, notes: 'Shot put & discus' },
];

// ── Empty form ────────────────────────────────────────────────
const EMPTY_FORM: Omit<Athlete, 'id'> = {
  name: '', dateOfBirth: '', sex: 'male',
  height: 170, weight: 65,
  shirtSize: 'M', shortSize: 'M', shoeSize: 42,
  notes: '',
};

// ── Athlete Form Modal ────────────────────────────────────────
interface FormModalProps {
  initial: Omit<Athlete, 'id'>;
  title: string;
  onSave: (data: Omit<Athlete, 'id'>) => void;
  onClose: () => void;
}

function AthleteFormModal({ initial, title, onSave, onClose }: FormModalProps) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Athlete, 'id'>, string>>>({});

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

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSave(form);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {/* Identity */}
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
              <input type="date" value={form.dateOfBirth} max={new Date().toISOString().split('T')[0]} onChange={e => set('dateOfBirth', e.target.value)} />
              {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth}</span>}
            </div>
            <div className="form-field">
              <label>Sex *</label>
              <select value={form.sex} onChange={e => set('sex', e.target.value as Athlete['sex'])}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Physical */}
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

          {/* Gear */}
          <p className="form-section-label">Gear Sizes</p>
          <div className="form-row">
            <div className="form-field">
              <label>Shirt</label>
              <div className="size-picker">
                {SIZES.map(s => (
                  <button key={s} type="button" className={`size-btn ${form.shirtSize === s ? 'size-btn--active' : ''}`} onClick={() => set('shirtSize', s)}>{s}</button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>Shorts</label>
              <div className="size-picker">
                {SIZES.map(s => (
                  <button key={s} type="button" className={`size-btn ${form.shortSize === s ? 'size-btn--active' : ''}`} onClick={() => set('shortSize', s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <p className="form-section-label">Notes</p>
          <div className="form-row">
            <div className="form-field form-field--full">
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any relevant notes…" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">Save Athlete</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="delete-modal">
          <div className="delete-icon">🗑️</div>
          <h2>Remove athlete?</h2>
          <p>Are you sure you want to remove <strong>{name}</strong>? This cannot be undone.</p>
          <div className="form-actions">
            <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn--danger" onClick={onConfirm}>Yes, Remove</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sorting ───────────────────────────────────────────────────
type SortKey = 'name' | 'sex' | 'age' | 'height' | 'weight' | 'shirtSize' | 'shortSize' | 'shoeSize';
type SortDir = 'asc' | 'desc';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function sortAthletes(list: Athlete[], key: SortKey, dir: SortDir): Athlete[] {
  return [...list].sort((a, b) => {
    let result = 0;
    if (key === 'age')       result = new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
    else if (key === 'shirtSize' || key === 'shortSize') result = SIZE_ORDER.indexOf(a[key]) - SIZE_ORDER.indexOf(b[key]);
    else if (typeof a[key] === 'number') result = (a[key] as number) - (b[key] as number);
    else result = String(a[key]).localeCompare(String(b[key]));
    return dir === 'asc' ? result : -result;
  });
}

// ── CSV Export ────────────────────────────────────────────────
function exportToCsv(list: Athlete[]) {
  const headers = ['Name', 'Gender', 'Age', 'Height (cm)', 'Weight (kg)', 'Shirt', 'Shorts', 'Shoe (EU)'];
  const rows = list.map(a => [
    `"${a.name}"`,
    a.sex,
    calcAge(a.dateOfBirth),
    a.height,
    a.weight,
    a.shirtSize,
    a.shortSize,
    a.shoeSize,
  ]);
  const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `athletes_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ─────────────────────────────────────────────────
interface AthletesPageProps {
  onViewProfile: (athlete: Athlete) => void;
}

export default function AthletesPage({ onViewProfile }: AthletesPageProps) {
  const [athletes, setAthletes] = useState<Athlete[]>(MOCK_ATHLETES);
  const [search, setSearch] = useState('');
  const [sexFilter, setSexFilter] = useState<'all' | Athlete['sex']>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="sort-icon sort-icon--inactive">↕</span>;
    return <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const [modal, setModal] = useState<
    | { type: 'none' }
    | { type: 'add' }
    | { type: 'edit'; athlete: Athlete }
    | { type: 'delete'; athlete: Athlete }
  >({ type: 'none' });

  const nextId = () => Math.max(0, ...athletes.map(a => a.id)) + 1;

  const handleAdd = (data: Omit<Athlete, 'id'>) => {
    setAthletes(prev => [...prev, { ...data, id: nextId() }].sort((a, b) => a.name.localeCompare(b.name)));
    setModal({ type: 'none' });
  };

  const handleEdit = (data: Omit<Athlete, 'id'>) => {
    if (modal.type !== 'edit') return;
    setAthletes(prev => prev.map(a => a.id === modal.athlete.id ? { ...data, id: a.id } : a));
    setModal({ type: 'none' });
  };

  const handleDelete = () => {
    if (modal.type !== 'delete') return;
    setAthletes(prev => prev.filter(a => a.id !== modal.athlete.id));
    setModal({ type: 'none' });
  };

  const filtered = sortAthletes(
    athletes.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchSex = sexFilter === 'all' || a.sex === sexFilter;
      return matchSearch && matchSex;
    }),
    sortKey,
    sortDir
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Athletes (Mock Data!)</h1>
          <p className="page-subtitle">{athletes.length} total athletes</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn--secondary" onClick={() => exportToCsv(filtered)}>
            ↓ Export CSV
          </button>
          <button className="btn btn--primary" onClick={() => setModal({ type: 'add' })}>
            + Add Athlete
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          className="filter-search"
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={sexFilter} onChange={e => setSexFilter(e.target.value as typeof sexFilter)}>
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <span className="filter-count">
          {filtered.length !== athletes.length ? `${filtered.length} of ${athletes.length}` : `${athletes.length} athletes`}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty">
          <p>No athletes match your filters.</p>
          <button className="btn btn--secondary" onClick={() => { setSearch(''); setSexFilter('all'); }}>Clear filters</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}    className="th-sortable">Name      <SortIcon col="name" /></th>
                <th onClick={() => handleSort('sex')}     className="th-sortable">Gender    <SortIcon col="sex" /></th>
                <th onClick={() => handleSort('age')}     className="th-sortable">Age       <SortIcon col="age" /></th>
                <th onClick={() => handleSort('height')}  className="th-sortable">Height    <SortIcon col="height" /></th>
                <th onClick={() => handleSort('weight')}  className="th-sortable">Weight    <SortIcon col="weight" /></th>
                <th onClick={() => handleSort('shirtSize')}  className="th-sortable">Shirt  <SortIcon col="shirtSize" /></th>
                <th onClick={() => handleSort('shortSize')}  className="th-sortable">Shorts <SortIcon col="shortSize" /></th>
                <th onClick={() => handleSort('shoeSize')}   className="th-sortable">Shoe   <SortIcon col="shoeSize" /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="table-row">
                  <td>
                    <div className="athlete-name-cell">
                      <div className={`avatar avatar--${a.sex}`}>{initials(a.name)}</div>
                      <span className="athlete-name-link" onClick={() => onViewProfile(a)}>{a.name}</span>
                    </div>
                  </td>
                  <td className="capitalize">{a.sex}</td>
                  <td>{calcAge(a.dateOfBirth)}</td>
                  <td>{a.height} cm</td>
                  <td>{a.weight} kg</td>
                  <td><span className="size-tag">{a.shirtSize}</span></td>
                  <td><span className="size-tag">{a.shortSize}</span></td>
                  <td>{a.shoeSize}</td>
                  <td>
                    <div className="row-actions">
                      <button className="action-btn action-btn--edit" onClick={() => setModal({ type: 'edit', athlete: a })}>Edit</button>
                      <button className="action-btn action-btn--delete" onClick={() => setModal({ type: 'delete', athlete: a })}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal.type === 'add' && (
        <AthleteFormModal title="Add New Athlete" initial={EMPTY_FORM} onSave={handleAdd} onClose={() => setModal({ type: 'none' })} />
      )}
      {modal.type === 'edit' && (
        <AthleteFormModal
          title="Edit Athlete"
          initial={{ name: modal.athlete.name, dateOfBirth: modal.athlete.dateOfBirth, sex: modal.athlete.sex, height: modal.athlete.height, weight: modal.athlete.weight, shirtSize: modal.athlete.shirtSize, shortSize: modal.athlete.shortSize, shoeSize: modal.athlete.shoeSize, notes: modal.athlete.notes ?? '' }}
          onSave={handleEdit}
          onClose={() => setModal({ type: 'none' })}
        />
      )}
      {modal.type === 'delete' && (
        <DeleteModal name={modal.athlete.name} onConfirm={handleDelete} onClose={() => setModal({ type: 'none' })} />
      )}
    </div>
  );
}