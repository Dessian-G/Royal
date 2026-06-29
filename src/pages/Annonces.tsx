import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Annonce } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import { Plus, Save, X, Pencil, Trash2, CheckCircle, Megaphone } from 'lucide-react'

export default function Annonces() {
  const { t } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [titre, setTitre] = useState('')
  const [contenu, setContenu] = useState('')
  const [departement, setDepartement] = useState('')
  const [toast, setToast] = useState('')

  const annonces = useLiveQuery(() =>
    db.annonces.orderBy('date').reverse().toArray()
  )

  const departements = useLiveQuery(() => db.departements.toArray())

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  function resetForm() {
    setDate(new Date().toISOString().split('T')[0])
    setTitre('')
    setContenu('')
    setDepartement('')
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSave() {
    if (!titre.trim() || !contenu.trim()) return

    if (editingId) {
      await db.annonces.update(editingId, { date, titre, contenu, departement: departement || undefined })
      setToast(t.annonces.saved)
    } else {
      await db.annonces.add({ date, titre, contenu, departement: departement || undefined, createdAt: new Date().toISOString() })
      setToast(t.annonces.saved)
    }
    resetForm()
  }

  function startEdit(a: Annonce) {
    setEditingId(a.id!)
    setDate(a.date)
    setTitre(a.titre)
    setContenu(a.contenu)
    setDepartement(a.departement || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: number) {
    if (confirm(t.annonces.deleteConfirm)) {
      await db.annonces.delete(id)
      setToast(t.annonces.deleted)
      if (editingId === id) resetForm()
    }
  }

  const grouped = annonces?.reduce<Record<string, Annonce[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = []
    acc[a.date].push(a)
    return acc
  }, {}) || {}

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-950">{t.annonces.title}</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-indigo-950 rounded-xl font-semibold hover:bg-gold-light transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            {t.annonces.new}
          </button>
        )}
      </div>

      {toast && (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm">
          <CheckCircle className="w-4 h-4" />
          {toast}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{t.annonces.date}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{t.annonces.titre}</label>
            <input type="text" value={titre} onChange={e => setTitre(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{t.annonces.contenu}</label>
            <textarea value={contenu} onChange={e => setContenu(e.target.value)} rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{t.annonces.departement}</label>
            <select value={departement} onChange={e => setDepartement(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:outline-none">
              <option value="">{t.annonces.aucun}</option>
              {departements?.map(d => (
                <option key={d.id} value={d.cle}>{t.departements[d.cle]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={!titre.trim() || !contenu.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 disabled:opacity-40 transition-colors cursor-pointer">
              <Save className="w-5 h-5" />
              {t.annonces.save}
            </button>
            <button onClick={resetForm}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
              {t.annonces.cancel}
            </button>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
          <p className="text-indigo-600">{t.annonces.noAnnonces}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateKey, items]) => {
          const dateStr = new Date(dateKey + 'T00:00:00').toLocaleDateString(
            undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
          )
          return (
            <div key={dateKey}>
              <h3 className="text-sm font-semibold text-indigo-700 capitalize mb-2">{dateStr}</h3>
              <div className="space-y-2">
                {items.map(a => (
                  <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border border-cream-dark">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-indigo-950">{a.titre}</h4>
                        <p className="text-sm text-indigo-800 mt-1 whitespace-pre-wrap">{a.contenu}</p>
                        {a.departement && (
                          <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            {t.departements[a.departement as keyof typeof t.departements] || a.departement}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => startEdit(a)}
                          className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 active:bg-indigo-300 transition-colors cursor-pointer">
                          <Pencil className="w-3.5 h-3.5 text-indigo-700" />
                        </button>
                        <button onClick={() => handleDelete(a.id!)}
                          className="p-2 bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
