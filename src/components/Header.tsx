import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import { Home, Users, Megaphone, Building2, BarChart3, Settings, FileText, LogOut, ShieldCheck, Video } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { lang, t, toggleLang } = useLanguage()
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/', label: t.nav.dashboard, icon: Home },
    { to: '/presences', label: t.nav.presences, icon: Users },
    { to: '/annonces', label: t.nav.annonces, icon: Megaphone },
    { to: '/departements', label: t.nav.departements, icon: Building2 },
    { to: '/statistiques', label: t.nav.statistiques, icon: BarChart3 },
    { to: '/rapport', label: t.nav.rapport, icon: FileText },
    { to: '/zoom', label: t.nav.zoom, icon: Video },
    { to: '/parametres', label: t.nav.parametres, icon: Settings },
    ...(isAdmin ? [{ to: '/utilisateurs', label: t.nav.utilisateurs, icon: ShieldCheck }] : []),
  ]

  return (
    <header className="bg-indigo-950 text-white sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 no-underline text-white">
          <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-full object-cover bg-white" />
          <div className="leading-tight hidden sm:block">
            <div className="font-serif font-bold text-sm tracking-wide text-gold">{t.app.name}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <span className="text-xs text-white/60 hidden sm:inline">
              {user.nom}
            </span>
          )}
          <button
            onClick={toggleLang}
            className="px-2 py-1 rounded bg-indigo-800 text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          <button
            onClick={logout}
            className="p-1.5 rounded bg-indigo-800 hover:bg-red-700 transition-colors cursor-pointer"
            title={t.nav.deconnexion}
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1 cursor-pointer"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex gap-1 px-4 pb-2 flex-wrap">
        {links.map(link => {
          const Icon = link.icon
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm no-underline transition-colors ${
                active
                  ? 'bg-gold text-indigo-950 font-semibold'
                  : 'text-white/80 hover:bg-indigo-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-indigo-800 px-4 py-2 space-y-1">
          {links.map(link => {
            const Icon = link.icon
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm no-underline transition-colors ${
                  active
                    ? 'bg-gold text-indigo-950 font-semibold'
                    : 'text-white/80 hover:bg-indigo-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
