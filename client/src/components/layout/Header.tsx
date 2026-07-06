import { NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
  }`;

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-surface/70 backdrop-blur-xl [html.light_&]:border-black/5 [html.light_&]:bg-surface-light/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue text-sm font-bold text-white shadow-glow-purple">
            R
          </span>
          <span className="text-base font-semibold tracking-tight">Rileys Crush Thingy</span>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Viewer
          </NavLink>
          <NavLink to="/studio" className={navLinkClass}>
            Bitmap Studio
          </NavLink>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle light / dark theme"
            className="btn-icon ml-2"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  );
}
