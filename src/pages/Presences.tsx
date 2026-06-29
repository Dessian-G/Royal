import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Service, getTotalPresents, getTotalFinances } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import Counter from '../components/Counter'
import { Save, Pencil, Trash2, X, CheckCircle, Calendar, Users, BookOpen, DollarSign, AlertTriangle } from 'lucide-react'

function getNextSunday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 0 : 7 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

const DEVISES = ['FCFA', 'USD', 'EUR']

const emptyForm = (): Omit<Service, 'id' | 'createdAt'> => ({
  date: getNextSunday(),
  adultesHommes: 0,
  adultesFemmes: 0,
  enfantsGarcons: 0,
  enfantsFilles: 0,
  dirigeant: '',
  predicateur: '',
  themeMessage: '',
  texteBiblique: '',
  resumeMessage: '',
  offrandes: 0,
  dimes: 0,
  autresDons: 0,
  devise: 'FCFA',
  noteFinances: '',
  saisiPar: '',
})

export default function Presences() {
  const { t } = useLanguage()
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const services = useLiveQuery(() =>
    db.services.orderBy('date').reverse().toArray()
  )

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast(msg)
    setToastType(type)
  }

  const totalPresents = form.adultesHommes + form.adultesFemmes + form.enfantsGarcons + form.enfantsFilles
  const totalFinances = (form.offrandes || 0) + (form.dimes || 0) + (form.autresDons || 0)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  async function handleSave() {
    if (!form.date) return

    try {
      if (editingId) {
        await db.services.update(editingId, { ...form })
        showToast(t.presences.updated)
        setEditingId(null)
        setForm(emptyForm())
      } else {
        const existing = await db.services.where('date').equals(form.date).first()
        if (existing) {
          if (confirm(t.presences.existingRecord)) {
            await db.services.update(existing.id!, { ...form })
            showToast(t.presences.updated)
            setForm(emptyForm())
          }
          return
        }
        await db.services.add({ ...form, createdAt: new Date().toISOString() })
        showToast(t.presences.saved)
        setForm(emptyForm())
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      showToast(t.common.error, 'error')
    }
  }

  function startEdit(s: Service) {
    setEditingId(s.id!)
    setForm({
      date: s.date,
      adultesHommes: s.adultesHommes,
      adultesFemmes: s.adultesFemmes,
      enfantsGarcons: s.enfantsGarcons,
      enfantsFilles: s.enfantsFilles,
      dirigeant: s.dirigeant,
      predicateur: s.predicateur,
      themeMessage: s.themeMessage,
      texteBiblique: s.texteBiblique,
      resumeMessage: s.resumeMessage || '',
      offrandes: s.offrandes || 0,
      dimes: s.dimes || 0,
      autresDons: s.autresDons || 0,
      devise: s.devise || 'FCFA',
      noteFinances: s.noteFinances || '',
      saisiPar: s.saisiPar || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: number) {
    if (confirm(t.presences.deleteConfirm)) {
      await db.services.delete(id)
      showToast(t.presences.deleted)
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm())
      }
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-950">{t.presences.title}</h1>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
          toastType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {toastType === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast}
        </div>
      )}

      {/* Formulaire */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark space-y-4">
        <div>
          <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.date}</label>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none text-indigo-950"
          />
        </div>

        <div className="space-y-2">
          <Counter label={t.presences.adultesHommes} value={form.adultesHommes} onChange={v => set('adultesHommes', v)} />
          <Counter label={t.presences.adultesFemmes} value={form.adultesFemmes} onChange={v => set('adultesFemmes', v)} />
          <Counter label={t.presences.enfantsGarcons} value={form.enfantsGarcons} onChange={v => set('enfantsGarcons', v)} />
          <Counter label={t.presences.enfantsFilles} value={form.enfantsFilles} onChange={v => set('enfantsFilles', v)} />
          <div className="text-right font-bold text-lg text-indigo-950 pt-2 border-t border-indigo-100">
            {t.presences.totalPresents} : <span className="text-gold">{totalPresents}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.dirigeant}</label>
            <input type="text" value={form.dirigeant} onChange={e => set('dirigeant', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.predicateur}</label>
            <input type="text" value={form.predicateur} onChange={e => set('predicateur', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.themeMessage}</label>
          <input type="text" value={form.themeMessage} onChange={e => set('themeMessage', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.texteBiblique}</label>
          <input type="text" value={form.texteBiblique} onChange={e => set('texteBiblique', e.target.value)}
            placeholder="ex. Jean 3:16"
            className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.resumeMessage}</label>
          <textarea value={form.resumeMessage} onChange={e => set('resumeMessage', e.target.value)} rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none resize-none" />
        </div>

        {/* Finances */}
        <div className="border-t border-indigo-100 pt-4">
          <h3 className="text-lg font-semibold text-indigo-950 mb-3">{t.presences.finances}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.offrandes}</label>
              <input type="number" min={0} value={form.offrandes ?? ''} onChange={e => set('offrandes', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.dimes}</label>
              <input type="number" min={0} value={form.dimes ?? ''} onChange={e => set('dimes', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.autresDons}</label>
              <input type="number" min={0} value={form.autresDons ?? ''} onChange={e => set('autresDons', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <label className="text-sm font-medium text-indigo-800">{t.presences.devise}</label>
            <select value={form.devise} onChange={e => set('devise', e.target.value)}
              className="px-3 py-2 rounded-xl border border-indigo-200 focus:border-gold focus:outline-none text-sm">
              {DEVISES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="ml-auto font-bold text-indigo-950">
              {t.presences.totalCollecte} : <span className="text-gold">{totalFinances.toLocaleString()} {form.devise}</span>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.noteFinances}</label>
            <input type="text" value={form.noteFinances} onChange={e => set('noteFinances', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-indigo-800 mb-1">{t.presences.saisiPar}</label>
          <input type="text" value={form.saisiPar} onChange={e => set('saisiPar', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave}
            disabled={!form.date}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 disabled:opacity-40 transition-colors cursor-pointer">
            <Save className="w-5 h-5" />
            {editingId ? t.presences.update : t.presences.save}
          </button>
          {editingId && (
            <button onClick={cancelEdit}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
              {t.presences.cancel}
            </button>
          )}
        </div>
      </div>

      {/* Historique */}
      <div>
        <h2 className="text-xl font-bold text-indigo-950 mb-3">{t.presences.history}</h2>
        {!services?.length ? (
          <p className="text-indigo-600 text-sm">{t.presences.noHistory}</p>
        ) : (
          <div className="space-y-3">
            {services.map(s => (
              <HistoryItem key={s.id} service={s} t={t}
                onEdit={() => startEdit(s)} onDelete={() => handleDelete(s.id!)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HistoryItem({ service: s, t, onEdit, onDelete }: {
  service: Service; t: any; onEdit: () => void; onDelete: () => void
}) {
  const total = getTotalPresents(s)
  const finances = getTotalFinances(s)
  const dateStr = new Date(s.date + 'T00:00:00').toLocaleDateString(
    undefined,
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-cream-dark">
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
          {s.themeMessage && (
            <div className="flex items-start gap-2 text-sm text-indigo-800">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="truncate">{s.themeMessage}</span>
            </div>
          )}
          {s.predicateur && (
            <div className="text-sm text-indigo-600 mt-0.5">
              {t.presences.predicateur} : {s.predicateur}
            </div>
          )}
          {finances > 0 && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 mt-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{finances.toLocaleString()} {s.devise}</span>
            </div>
          )}
        </div>
        {/* Boutons toujours visibles (mobile-friendly) */}
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit}
            className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 active:bg-indigo-300 transition-colors cursor-pointer"
            title={t.presences.edit}>
            <Pencil className="w-4 h-4 text-indigo-700" />
          </button>
          <button onClick={onDelete}
            className="p-2 bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300 transition-colors cursor-pointer"
            title={t.presences.delete}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
