import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getTotalPresents } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import { FileText, Download } from 'lucide-react'
import { generateMonthlyPdf } from '../utils/exportPdf'

export default function RapportMensuel() {
  const { t } = useLanguage()
  const now = new Date()
  const [mois, setMois] = useState(now.getMonth())
  const [annee, setAnnee] = useState(now.getFullYear())

  const services = useLiveQuery(() => db.services.orderBy('date').toArray())

  const filtered = services?.filter(s => {
    const d = new Date(s.date + 'T00:00:00')
    return d.getMonth() === mois && d.getFullYear() === annee
  }) || []

  const totalPresents = filtered.reduce((s, sv) => s + getTotalPresents(sv), 0)
  const moyPresents = filtered.length ? Math.round(totalPresents / filtered.length) : 0
  const meilleur = filtered.length ? filtered.reduce((best, s) => getTotalPresents(s) > getTotalPresents(best) ? s : best) : null

  const totalOffrandes = filtered.reduce((s, sv) => s + (sv.offrandes || 0), 0)
  const totalDimes = filtered.reduce((s, sv) => s + (sv.dimes || 0), 0)
  const totalAutres = filtered.reduce((s, sv) => s + (sv.autresDons || 0), 0)
  const totalCollecte = totalOffrandes + totalDimes + totalAutres
  const moyFinances = filtered.length ? Math.round(totalCollecte / filtered.length) : 0
  const devise = filtered[0]?.devise || 'FCFA'

  const predicateurs = [...new Set(filtered.map(s => s.predicateur).filter(Boolean))]
  const themes = filtered.filter(s => s.themeMessage).map(s => ({ theme: s.themeMessage, texte: s.texteBiblique }))
  const dirigeants = [...new Set(filtered.map(s => s.dirigeant).filter(Boolean))]

  const years = Array.from({ length: 10 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-950">{t.rapport.title}</h1>

      {/* Sélecteurs */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-medium text-indigo-800 mb-1">{t.rapport.mois}</label>
          <select value={mois} onChange={e => setMois(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:outline-none">
            {t.mois.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div className="w-28">
          <label className="block text-sm font-medium text-indigo-800 mb-1">{t.rapport.annee}</label>
          <select value={annee} onChange={e => setAnnee(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-cream-dark">
          <FileText className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <p className="text-indigo-600">{t.rapport.noData}</p>
        </div>
      ) : (
        <>
          {/* Présences */}
          <Section title={t.rapport.presences}>
            <Row label={t.rapport.nbDimanches} value={filtered.length.toString()} />
            <Row label={t.rapport.totalGeneral} value={totalPresents.toString()} />
            <Row label={t.rapport.moyenne} value={moyPresents.toString()} />
            {meilleur && (
              <Row label={t.rapport.meilleurDimanche}
                value={`${new Date(meilleur.date + 'T00:00:00').toLocaleDateString(undefined, { day: '2-digit', month: 'long' })} — ${getTotalPresents(meilleur)}`} />
            )}
          </Section>

          {/* Finances */}
          <Section title={t.rapport.finances}>
            <Row label={t.rapport.totalOffrandes} value={`${totalOffrandes.toLocaleString()} ${devise}`} />
            <Row label={t.rapport.totalDimes} value={`${totalDimes.toLocaleString()} ${devise}`} />
            <Row label={t.rapport.totalAutresDons} value={`${totalAutres.toLocaleString()} ${devise}`} />
            <Row label={t.rapport.totalCollecte} value={`${totalCollecte.toLocaleString()} ${devise}`} bold />
            <Row label={t.rapport.moyenneFinances} value={`${moyFinances.toLocaleString()} ${devise}`} />
          </Section>

          {/* Messages */}
          <Section title={t.rapport.messages}>
            {themes.map((th, i) => (
              <div key={i} className="border-b border-indigo-50 py-2 last:border-0">
                <div className="font-medium text-indigo-950">{th.theme}</div>
                {th.texte && <div className="text-sm text-indigo-600">{th.texte}</div>}
              </div>
            ))}
          </Section>

          {/* Dirigeants + Prédicateurs */}
          <Section title={t.rapport.dirigeants}>
            <div className="flex flex-wrap gap-2">
              {dirigeants.map(d => (
                <span key={d} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">{d}</span>
              ))}
            </div>
            <div className="mt-3">
              <span className="text-sm font-medium text-indigo-800">{t.statistiques.predicateur} : </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {predicateurs.map(p => (
                  <span key={p} className="bg-gold/20 text-indigo-900 px-3 py-1 rounded-full text-sm">{p}</span>
                ))}
              </div>
            </div>
          </Section>

          {/* Export PDF */}
          <button
            onClick={() => generateMonthlyPdf(filtered, t.mois[mois], annee, t)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-colors cursor-pointer"
          >
            <Download className="w-5 h-5" />
            {t.rapport.exportPdf}
          </button>
        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
      <h2 className="text-lg font-bold text-indigo-950 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-indigo-50 last:border-0">
      <span className="text-sm text-indigo-700">{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-gold' : 'font-medium text-indigo-950'}`}>{value}</span>
    </div>
  )
}
