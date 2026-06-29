import { useLiveQuery } from 'dexie-react-hooks'
import { db, getTotalPresents, getTotalAdultes, getTotalEnfants, getTotalFinances } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import { BarChart3 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts'

export default function Statistiques() {
  const { t } = useLanguage()

  const services = useLiveQuery(() =>
    db.services.orderBy('date').toArray()
  )

  if (!services || services.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center py-12">
        <BarChart3 className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
        <p className="text-indigo-600">{t.statistiques.noData}</p>
      </div>
    )
  }

  const totalServices = services.length
  const totalPresents = services.reduce((s, sv) => s + getTotalPresents(sv), 0)
  const moyennePresents = Math.round(totalPresents / totalServices)
  const totalOffrandes = services.reduce((s, sv) => s + (sv.offrandes || 0), 0)
  const totalDimes = services.reduce((s, sv) => s + (sv.dimes || 0), 0)
  const devise = services[services.length - 1]?.devise || 'FCFA'

  const presenceData = services.map(s => ({
    date: new Date(s.date + 'T00:00:00').toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    total: getTotalPresents(s),
    adultes: getTotalAdultes(s),
    enfants: getTotalEnfants(s),
    hommes: s.adultesHommes + s.enfantsGarcons,
    femmes: s.adultesFemmes + s.enfantsFilles,
  }))

  const financeData = services.map(s => ({
    date: new Date(s.date + 'T00:00:00').toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    offrandes: s.offrandes || 0,
    dimes: s.dimes || 0,
    autres: s.autresDons || 0,
  }))

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-950">{t.statistiques.title}</h1>

      {/* Résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={t.statistiques.totalServices} value={totalServices.toString()} />
        <StatCard label={t.statistiques.moyennePresences} value={moyennePresents.toString()} />
        <StatCard label={t.statistiques.totalOffrandes} value={`${totalOffrandes.toLocaleString()} ${devise}`} />
        <StatCard label={t.statistiques.totalDimes} value={`${totalDimes.toLocaleString()} ${devise}`} />
      </div>

      {/* Graphique présences */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
        <h2 className="text-lg font-bold text-indigo-950 mb-3">{t.statistiques.evolutionPresences}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={presenceData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" name={t.statistiques.total} stroke="#d4af37" strokeWidth={2} />
            <Line type="monotone" dataKey="adultes" name={t.statistiques.adultes} stroke="#4338ca" strokeWidth={1.5} />
            <Line type="monotone" dataKey="enfants" name={t.statistiques.enfants} stroke="#4f46e5" strokeWidth={1.5} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique finances */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
        <h2 className="text-lg font-bold text-indigo-950 mb-3">{t.statistiques.evolutionFinances}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={financeData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="offrandes" name={t.statistiques.offrandes} fill="#d4af37" radius={[4, 4, 0, 0]} />
            <Bar dataKey="dimes" name={t.statistiques.dimes} fill="#4338ca" radius={[4, 4, 0, 0]} />
            <Bar dataKey="autres" name={t.statistiques.autresDons} fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark overflow-x-auto">
        <h2 className="text-lg font-bold text-indigo-950 mb-3">{t.statistiques.tableau}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-indigo-100">
              <th className="text-left py-2 px-2 text-indigo-700">{t.statistiques.date}</th>
              <th className="text-right py-2 px-2 text-indigo-700">{t.statistiques.presents}</th>
              <th className="text-left py-2 px-2 text-indigo-700">{t.statistiques.predicateur}</th>
              <th className="text-left py-2 px-2 text-indigo-700">{t.statistiques.theme}</th>
              <th className="text-right py-2 px-2 text-indigo-700">{t.statistiques.finances}</th>
            </tr>
          </thead>
          <tbody>
            {services.slice().reverse().map(s => (
              <tr key={s.id} className="border-b border-indigo-50 hover:bg-cream">
                <td className="py-2 px-2 text-indigo-950">
                  {new Date(s.date + 'T00:00:00').toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}
                </td>
                <td className="py-2 px-2 text-right font-semibold text-indigo-950">{getTotalPresents(s)}</td>
                <td className="py-2 px-2 text-indigo-800 truncate max-w-[120px]">{s.predicateur}</td>
                <td className="py-2 px-2 text-indigo-800 truncate max-w-[150px]">{s.themeMessage}</td>
                <td className="py-2 px-2 text-right text-indigo-700">{getTotalFinances(s).toLocaleString()} {s.devise}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-cream-dark text-center">
      <div className="text-lg font-bold text-gold">{value}</div>
      <div className="text-xs text-indigo-600 mt-1">{label}</div>
    </div>
  )
}
