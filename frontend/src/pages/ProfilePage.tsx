import type { Athlete } from '../types/athlete';
import '../pages/ProfilePage.css';

interface ProfilePageProps {
  athlete: Athlete;
  onBack: () => void;
}

export default function ProfilePage({ athlete, onBack }: ProfilePageProps) {
  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn--secondary" onClick={onBack}>← Back to Athletes</button>
      </div>
      <div className="empty">
        <p><strong>{athlete.name}</strong> — profile coming soon.</p>
      </div>
    </div>
  );
}