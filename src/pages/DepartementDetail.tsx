import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dataService } from '../lib/dataService'
import { useSingle } from '../lib/useCollection'
import { useLanguage } from '../i18n/LanguageContext'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'

export default function DepartementDetail() {
  const { cle } = useParams<{ cle: string }>()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState('')

  const { data: dep, refresh } = useSingle(() => dataService.getDepartementByCle(cle || ''), [cle])

  const [responsable, setResponsable] = useState('')
  const [contact, setContact] = useState('')
  const [description, setDescription] = useState('')
  const [membres, setMembres] = useState(0)
  const [activites, setActivites] = useState('')

  useEffect(() => {
    if (dep) {
      setResponsable(dep.responsable || ''); setContact(dep.contact_responsable || '')
      setDescription(dep.description || ''); setMembres(dep.nombre_membres || 0); setActivites(dep.activites || '')
    }
  }, [dep])

  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 3000); return () => clearTimeout(timer) } }, [toast])

  async function handleSave() {
    if (!dep) return
    await dataService.updateDepartement(dep.id!, { responsable, contact_responsable: contact, description, nombre_membres: membres, activites })
    setToast(t.departements.updated); setEditing(false); refresh()
  }

  if (!dep) return <div className="p-4 text-center text-indigo-600">{t.common.loading}</div>

  const nom = t.departements[dep.cle as keyof typeof t.departements] || dep.nom

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate('/departements')} className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> {t.common.back}
      </button>
      <h1 className="text-2xl font-bold text-indigo-950">{nom}</h1>

      {toast && <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm"><CheckCircle className="w-4 h-4" />{toast}</div>}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark space-y-4">
        {editing ? (
          <>
            <Field label={t.departements.responsable} value={responsable} onChange={setResponsable} />
            <Field label={t.departements.contact} value={contact} onChange={setContact} />
            <Field label={t.departements.description} value={description} onChange={setDescription} multiline />
            <div><label className="block text-sm font-medium text-indigo-800 mb-1">{t.departements.membres}</label>
              <input type="number" min={0} value={membres || ''} onChange={e => setMembres(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" /></div>
            <Field label={t.departements.activites} value={activites} onChange={setActivites} multiline />
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-colors cursor-pointer"><Save className="w-5 h-5" />{t.departements.save}</button>
              <button onClick={() => setEditing(false)} className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer">{t.departements.cancel}</button>
            </div>
          </>
        ) : (
          <>
            <InfoRow label={t.departements.responsable} value={dep.responsable} fallback={t.departements.nonRenseigne} />
            <InfoRow label={t.departements.contact} value={dep.contact_responsable} fallback={t.departements.nonRenseigne} />
            <InfoRow label={t.departements.description} value={dep.description} fallback={t.departements.nonRenseigne} />
            <InfoRow label={t.departements.membres} value={dep.nombre_membres?.toString()} fallback={t.departements.nonRenseigne} />
            <InfoRow label={t.departements.activites} value={dep.activites} fallback={t.departements.nonRenseigne} />
            <button onClick={() => setEditing(true)} className="w-full py-3 bg-gold text-indigo-950 rounded-xl font-semibold hover:bg-gold-light transition-colors cursor-pointer">{t.departements.edit}</button>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = "w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none"
  return (
    <div><label className="block text-sm font-medium text-indigo-800 mb-1">{label}</label>
      {multiline ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={cls + ' resize-none'} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} />}
    </div>
  )
}

function InfoRow({ label, value, fallback }: { label: string; value?: string | null; fallback: string }) {
  return (
    <div className="border-b border-indigo-50 pb-3 last:border-0">
      <span className="block text-xs font-medium text-indigo-600 uppercase tracking-wide">{label}</span>
      <span className="text-indigo-950 whitespace-pre-wrap">{value || fallback}</span>
    </div>
  )
}
