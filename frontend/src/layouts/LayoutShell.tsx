import React from 'react';
import { NavLink } from 'react-router-dom';
import type { UserRole } from '../types';

export interface NavItem {
  label: string;
  description?: string;
  to: string;
}

interface LayoutShellProps {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  userName?: string;
  role?: UserRole | null;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  title,
  subtitle,
  navItems,
  userName,
  role,
  onLogout,
  children
}) => {
  return (
    <div className="layout-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="layout-shell__header">
        <div>
          <h1 style={{ margin: 0 }}>{title}</h1>
          {subtitle ? <p style={{ margin: 0, opacity: 0.85 }}>{subtitle}</p> : null}
        </div>
        <div aria-live="polite">
          {userName ? (
            <p style={{ margin: 0 }}>
              Signed in as <strong>{userName}</strong>
              {role ? (
                <span className="badge badge--success" style={{ marginLeft: '0.5rem' }}>
                  {role.toUpperCase()}
                </span>
              ) : null}
            </p>
          ) : (
            <p style={{ margin: 0 }}>Not signed in</p>
          )}
          {onLogout ? (
            <button type="button" onClick={onLogout} style={{ marginTop: '0.5rem' }}>
              Log out
            </button>
          ) : null}
        </div>
      </header>
      <div className="layout-shell__body">
        <nav aria-label="Primary navigation" className="layout-shell__nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <span style={{ display: 'block', fontWeight: 600 }}>{item.label}</span>
                  {item.description ? (
                    <span style={{ display: 'block', fontSize: '0.85rem', opacity: 0.7 }}>
                      {item.description}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main-content" className="layout-shell__main">
          {children}
        </main>
      </div>
    </div>
  );
};
