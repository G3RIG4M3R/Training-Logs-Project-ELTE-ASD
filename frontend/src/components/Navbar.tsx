import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

const LINKS = [
  { to: '/athletes', label: 'Athletes', end: true },
  { to: '/attendance', label: 'Attendance', end: false },
  { to: '/results', label: 'Results', end: false },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <span className="navbar-logo">TrainingLog</span>
        <button
          type="button"
          className="navbar-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
          onClick={() => setMenuOpen(open => !open)}
        >
          <span className={`navbar-toggle-icon${menuOpen ? ' navbar-toggle-icon--open' : ''}`} />
        </button>
        <div className="navbar-links navbar-links--desktop">
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
      </div>

      {menuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}

      <div
        id="navbar-menu"
        className={`navbar-menu${menuOpen ? ' navbar-menu--open' : ''}`}
        hidden={!menuOpen}
      >
        {LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `navbar-link navbar-link--menu${isActive ? ' navbar-link--active' : ''}`
            }
            onClick={closeMenu}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
