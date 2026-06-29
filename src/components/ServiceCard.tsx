import { type Service, getTotalPresents, getTotalFinances } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import { Calendar, Users, BookOpen, DollarSign } from 'lucide-react'

interface ServiceCardProps {
  service: Service
  onClick?: () => void
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const { t } = useLanguage()
  const total = getTotalPresents(service)
  const finances = getTotalFinances(service)

  const dateStr = new Date(service.date + 'T00:00:00').toLocaleDateString(
    undefined,
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 shadow-sm border border-cream-dark ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gold/40 transition-all' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-indigo-700 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="capitalize">{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gold" />
            <span className="font-bold text-indigo-950">{total} {t.presences.presents}</span>
          </div>
          {service.themeMessage && (
            <div className="flex items-start gap-2 text-sm text-indigo-800">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="truncate">{service.themeMessage}</span>
            </div>
          )}
          {finances > 0 && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 mt-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{finances.toLocaleString()} {service.devise}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
