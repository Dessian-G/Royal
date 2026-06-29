import { dataService, getTotalPresents, getTotalAdultes, getTotalEnfants } from '../lib/dataService'
import { useCollection } from '../lib/useCollection'
import { useLanguage } from '../i18n/LanguageContext'
import { Link } from 'react-router-dom'
import { Users, Megaphone, Building2, PenLine } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import BackupReminder from '../components/BackupReminder'

export default function Dashboard() {
  const { t } = useLanguage()
  const { data: services } = useCollection(() => dataService.getServices())

  const lastService = services[0]
  const lastTotal = lastService ? getTotalPresents(lastService) : 0
  const lastAdultes = lastService ? getTotalAdultes(lastService) : 0
  const lastEnfants = lastService ? getTotalEnfants(lastService) : 0

  const chartData = services
    .slice()
    .reverse()
    .slice(-12)
    .map(s => ({
      date: new Date(s.date + 'T00:00:00').toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
      total: getTotalPresents(s),
    }))

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="text-center py-6">
        <img src="/logo.png" alt="Logo Royal Ministry" className="w-24 h-24 mx-auto mb-3 rounded-full object-cover bg-white shadow-md" />
        <h1 className="text-2xl font-bold text-indigo-950">{t.app.name}</h1>
        <p className="text-indigo-600 text-sm">{t.app.subtitle}</p>
      </div>

      <BackupReminder />

      {!lastService ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-cream-dark">
          <Users className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <p className="text-indigo-600 mb-4">{t.dashboard.noData}</p>
          <Link to="/presences"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-indigo-950 rounded-xl font-semibold hover:bg-gold-light transition-colors no-underline">
            <PenLine className="w-5 h-5" />
            {t.dashboard.startNow}
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
            <h2 className="text-lg font-bold text-indigo-950 mb-3">{t.dashboard.lastSunday}</h2>
            <div className="text-sm text-indigo-700 mb-2 capitalize">
              {new Date(lastService.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatBox label={t.dashboard.totalPresents} value={lastTotal} color="text-gold" />
              <StatBox label={t.dashboard.adultes} value={lastAdultes} color="text-indigo-700" />
              <StatBox label={t.dashboard.enfants} value={lastEnfants} color="text-indigo-500" />
            </div>
            <div className="text-sm text-indigo-800 space-y-1">
              {lastService.dirigeant && <p><span className="font-medium">{t.dashboard.dirigeant} :</span> {lastService.dirigeant}</p>}
              {lastService.predicateur && <p><span className="font-medium">{t.dashboard.predicateur} :</span> {lastService.predicateur}</p>}
              {lastService.theme_message && <p><span className="font-medium">{t.dashboard.theme} :</span> {lastService.theme_message}</p>}
            </div>
          </div>

          {chartData.length > 1 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
              <h2 className="text-lg font-bold text-indigo-950 mb-3">{t.dashboard.evolution}</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#d4af37" strokeWidth={2} dot={{ r: 4, fill: '#d4af37' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      <div>
        <h2 className="text-lg font-bold text-indigo-950 mb-3">{t.dashboard.quickAccess}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickLink to="/presences" icon={PenLine} label={t.dashboard.enterSunday} color="bg-indigo-900" />
          <QuickLink to="/annonces" icon={Megaphone} label={t.nav.annonces} color="bg-indigo-800" />
          <QuickLink to="/departements" icon={Building2} label={t.nav.departements} color="bg-indigo-700" />
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-3 bg-cream rounded-xl">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-indigo-600 mt-1">{label}</div>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, color }: { to: string; icon: typeof PenLine; label: string; color: string }) {
  return (
    <Link to={to} className={`flex items-center gap-3 ${color} text-white rounded-xl p-4 hover:opacity-90 transition-opacity no-underline`}>
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  )
}
