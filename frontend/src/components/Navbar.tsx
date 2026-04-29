import './Navbar.css';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const LINKS = [
  { id: 'athletes', label: 'Athletes' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'results', label: 'Results' },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  return (
    <nav className="navbar">
      <span className="navbar-logo">TrainingLog</span>
      <div className="navbar-links">
        {LINKS.map(link => (
          <button
            key={link.id}
            className={`navbar-link ${currentPage === link.id ? 'navbar-link--active' : ''}`}
            onClick={() => onNavigate(link.id)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}