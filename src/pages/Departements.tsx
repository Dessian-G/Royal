import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import { Link } from 'react-router-dom'
import { Users, Music, Heart, Baby } from 'lucide-react'

const ICONS = {
  enfants: Baby,
  jeunes: Users,
  femmes: Heart,
  groupe_musical: Music,
}

const COLORS = {
  enfants: 'from-orange-400 to-orange-600',
  jeunes: 'from-blue-400 to-blue-600',
  femmes: 'from-pink-400 to-pink-600',
  groupe_musical: 'from-purple-400 to-purple-600',
}

export default function Departements() {
  const { t } = useLanguage()
  const departements = useLiveQuery(() => db.departements.toArray())

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-950">{t.departements.title}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {departements?.map(dep => {
          const Icon = ICONS[dep.cle] || Users
          const gradient = COLORS[dep.cle] || 'from-gray-400 to-gray-600'

          return (
            <Link
              key={dep.id}
              to={`/departements/${dep.cle}`}
              className="no-underline"
            >
              <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-shadow`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-serif">{t.departements[dep.cle]}</h3>
                </div>
                <div className="space-y-1 text-sm text-white/90">
                  <p>
                    <span className="font-medium">{t.departements.responsable} :</span>{' '}
                    {dep.responsable || t.departements.nonRenseigne}
                  </p>
                  {dep.nombreMembres != null && dep.nombreMembres > 0 && (
                    <p>
                      <span className="font-medium">{t.departements.membres} :</span> {dep.nombreMembres}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
