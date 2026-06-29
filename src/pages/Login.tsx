import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { LogIn, AlertTriangle, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const { lang, t, toggleLang } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return

    setLoading(true)
    setError(false)

    const ok = await login(username, password)
    if (!ok) {
      setError(true)
      setLoading(false)
    }
  }

  const labels = lang === 'fr' ? {
    title: 'Connexion',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    submit: 'Se connecter',
    error: "Nom d'utilisateur ou mot de passe incorrect.",
    welcome: 'Bienvenue',
  } : {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    submit: 'Sign in',
    error: 'Invalid username or password.',
    welcome: 'Welcome',
  }

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo + titre */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-28 h-28 mx-auto mb-4 rounded-full bg-white shadow-lg object-cover" />
          <h1 className="font-serif text-xl font-bold text-gold tracking-wide">{t.app.name}</h1>
          <p className="text-white/60 text-sm mt-1">Temple of Reconciliation</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-indigo-950 font-serif text-center">{labels.title}</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {labels.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{labels.username}</label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(false) }}
              autoComplete="username"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none text-indigo-950"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{labels.password}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none text-indigo-950"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            {loading ? '...' : labels.submit}
          </button>
        </form>

        {/* Langue */}
        <div className="text-center mt-4">
          <button
            onClick={toggleLang}
            className="text-white/50 text-sm hover:text-white/80 transition-colors cursor-pointer"
          >
            {lang === 'fr' ? 'English' : 'Français'}
          </button>
        </div>
      </div>
    </div>
  )
}
