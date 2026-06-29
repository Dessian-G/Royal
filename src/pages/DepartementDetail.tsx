import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'

export default function DepartementDetail() {
  const { cle } = useParams<{ cle: string }>()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState('')

  const dep = useLiveQuery(() =>
    db.departements.where('cle').equals(cle || '').first()
  , [cle])

  const [responsable, setResponsable] = useState('')
  const [contact, setContact] = useState('')
  const [description, setDescription] = useState('')
  const [membres, setMembres] = useState(0)
  const [activites, setActivites] = useState('')

  useEffect(() => {
    if (dep) {
      setResponsable(dep.responsable || '')
      setContact(dep.contactResponsable || '')
      setDescription(dep.description || '')
      setMembres(dep.nombreMembres || 0)
      setActivites(dep.activites || '')
    }
  }, [dep])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  async function handleSave() {
    if (!dep) return
    await db.departements.update(dep.id!, {
      responsable,
      contactResponsable: contact,
      description,
      nombreMembres: membres,
      activites,
      updatedAt: new Date().toISOString(),
    })
    setToast(t.departements.updated)
    setEditing(false)
  }

  if (!dep) return <div className="p-4 text-center text-indigo-600">{t.common.loading}</div>

  const cleKey = dep.cle as keyof typeof t.departements
  const nom = t.departements[cleKey] || dep.nom

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate('/departements')}
        className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        {t.common.back}
      </button>

      <h1 className="text-2xl font-bold text-indigo-950">{nom}</h1>

      {toast && (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm">
          <CheckCircle className="w-4 h-4" />
          {toast}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark space-y-4">
        {editing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">{t.departements.responsable}</label>
              <input type="text" value={responsable} onChange={e => setResponsable(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">{t.departements.contact}</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">{t.departements.description}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">{t.departements.membres}</label>
              <input type="number" min={0} value={membres || ''} onChange={e => setMembres(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">{t.departements.activites}</label>
              <textarea value={activites} onChange={e => setActivites(e.target.value)} rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-colors cursor-pointer">
                <Save className="w-5 h-5" />
                {t.departements.save}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer">
                {t.departements.cancel}
              </button>
            </div>
          </>
        ) : (
          <>
            <InfoRow label={t.departements.responsable} value={dep.responsable} fallback={t.departements.nonRenseigne} />
            <InfoRow label={t.departements.contact} value={dep.contactResponsable} fallback={t.departements.nonRenseigne} />
            <InfoRow label={t.departements.description} value={dep.description} fallback={t.departements.nonRenseigne} />
            <InfoRow label={t.departements.membres} value={dep.nombreMembres?.toString()} fallback={t.departements.nonRenseigne} />
            <InfoRow label={t.departements.activites} value={dep.activites} fallback={t.departements.nonRenseigne} />
            <button onClick={() => setEditing(true)}
              className="w-full py-3 bg-gold text-indigo-950 rounded-xl font-semibold hover:bg-gold-light transition-colors cursor-pointer">
              {t.departements.edit}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, fallback }: { label: string; value?: string; fallback: string }) {
  return (
    <div className="border-b border-indigo-50 pb-3 last:border-0">
      <span className="block text-xs font-medium text-indigo-600 uppercase tracking-wide">{label}</span>
      <span className="text-indigo-950 whitespace-pre-wrap">{value || fallback}</span>
    </div>
  )
}
