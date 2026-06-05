import { NavLink } from 'react-router-dom';
import './Navbar.css';

const LINKS = [
  { to: '/athletes', label: 'Athletes', end: true },
  { to: '/attendance', label: 'Attendance', end: false },
  { to: '/results', label: 'Results', end: false },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-logo">TrainingLog</span>
      <div className="navbar-links">
        {LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `navbar-link${isActive ? ' navbar-link--active' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
