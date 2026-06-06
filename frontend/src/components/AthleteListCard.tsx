import type { Athlete } from '../types/athlete';

interface AthleteListCardProps {
  athlete: Athlete;
  age: number;
  initials: string;
  onOpenProfile: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AthleteListCard({
  athlete,
  age,
  initials,
  onOpenProfile,
  onEdit,
  onDelete,
}: AthleteListCardProps) {
  return (
    <article className="mobile-card">
      <div className="mobile-card-header">
        <div className={`avatar avatar--${athlete.sex}`}>{initials}</div>
        <button type="button" className="athlete-name-link mobile-card-title" onClick={onOpenProfile}>
          {athlete.name}
        </button>
      </div>

      <div className="mobile-card-grid">
        <div className="mobile-card-field">
          <label>Gender</label>
          <span className="capitalize">{athlete.sex}</span>
        </div>
        <div className="mobile-card-field">
          <label>Age</label>
          <span>{age}</span>
        </div>
        <div className="mobile-card-field">
          <label>Height</label>
          <span>{athlete.height} cm</span>
        </div>
        <div className="mobile-card-field">
          <label>Weight</label>
          <span>{athlete.weight} kg</span>
        </div>
      </div>

      <div className="mobile-card-tags">
        <span className="size-tag">Shirt {athlete.shirtSize}</span>
        <span className="size-tag">Shorts {athlete.shortSize}</span>
        <span className="size-tag">Shoe {athlete.shoeSize}</span>
      </div>

      <div className="mobile-card-actions">
        <button type="button" className="action-btn action-btn--edit" onClick={onEdit}>Edit</button>
        <button type="button" className="action-btn action-btn--delete" onClick={onDelete}>Delete</button>
      </div>
    </article>
  );
}
