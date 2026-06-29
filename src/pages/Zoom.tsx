import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ZoomLink } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import { Video, ExternalLink, Copy, CheckCircle, Plus, Pencil, Trash2, Save, X, AlertTriangle } from 'lucide-react'

export default function Zoom() {
  const { lang } = useLanguage()
  const { isAdmin } = useAuth()
  const [copied, setCopied] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [titre, setTitre] = useState('')
  const [url, setUrl] = useState('')
  const [meetingId, setMeetingId] = useState('')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const links = useLiveQuery(() => db.zoomLinks.toArray())

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const labels = lang === 'fr' ? {
    title: 'Réunions Zoom',
    subtitle: 'Rejoignez le culte en ligne',
    join: 'Rejoindre',
    meetingIdLabel: 'ID de réunion',
    copyLink: 'Copier le lien',
    copied: 'Copié !',
    tip: 'Installez l\'application Zoom sur votre téléphone pour une meilleure expérience.',
    noLinks: 'Aucun lien de réunion pour le moment.',
    addLink: 'Ajouter un lien',
    editLink: 'Modifier',
    deleteLink: 'Supprimer',
    deleteConfirm: 'Supprimer ce lien ?',
    titleField: 'Titre de la réunion',
    urlField: 'Lien Zoom',
    meetingIdField: 'ID de réunion (optionnel)',
    save: 'Enregistrer',
    cancel: 'Annuler',
    saved: 'Lien enregistré !',
    deleted: 'Lien supprimé.',
    urlPlaceholder: 'https://us02web.zoom.us/j/...',
  } : {
    title: 'Zoom Meetings',
    subtitle: 'Join the online service',
    join: 'Join',
    meetingIdLabel: 'Meeting ID',
    copyLink: 'Copy link',
    copied: 'Copied!',
    tip: 'Install the Zoom app on your phone for a better experience.',
    noLinks: 'No meeting link available yet.',
    addLink: 'Add a link',
    editLink: 'Edit',
    deleteLink: 'Delete',
    deleteConfirm: 'Delete this link?',
    titleField: 'Meeting title',
    urlField: 'Zoom link',
    meetingIdField: 'Meeting ID (optional)',
    save: 'Save',
    cancel: 'Cancel',
    saved: 'Link saved!',
    deleted: 'Link deleted.',
    urlPlaceholder: 'https://us02web.zoom.us/j/...',
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast(msg)
    setToastType(type)
  }

  function resetForm() {
    setTitre('')
    setUrl('')
    setMeetingId('')
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSave() {
    if (!titre.trim() || !url.trim()) return

    if (editingId) {
      await db.zoomLinks.update(editingId, { titre: titre.trim(), url: url.trim(), meetingId: meetingId.trim() || undefined })
    } else {
      await db.zoomLinks.add({ titre: titre.trim(), url: url.trim(), meetingId: meetingId.trim() || undefined, createdAt: new Date().toISOString() })
    }
    showToast(labels.saved)
    resetForm()
  }

  function startEdit(link: ZoomLink) {
    setEditingId(link.id!)
    setTitre(link.titre)
    setUrl(link.url)
    setMeetingId(link.meetingId || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: number) {
    if (!confirm(labels.deleteConfirm)) return
    await db.zoomLinks.delete(id)
    showToast(labels.deleted)
    if (editingId === id) resetForm()
  }

  async function handleCopy(id: number, linkUrl: string) {
    await navigator.clipboard.writeText(linkUrl)
    setCopied(id)
    setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-950">{labels.title}</h1>
        {isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-indigo-950 rounded-xl font-semibold hover:bg-gold-light transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            {labels.addLink}
          </button>
        )}
      </div>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
          toastType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {toastType === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast}
        </div>
      )}

      {/* Formulaire admin */}
      {isAdmin && showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{labels.titleField}</label>
            <input type="text" value={titre} onChange={e => setTitre(e.target.value)}
              placeholder="ex. Culte dominical"
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{labels.urlField}</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder={labels.urlPlaceholder}
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1">{labels.meetingIdField}</label>
            <input type="text" value={meetingId} onChange={e => setMeetingId(e.target.value)}
              placeholder="ex. 842 1462 4356"
              className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={!titre.trim() || !url.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 disabled:opacity-40 transition-colors cursor-pointer">
              <Save className="w-5 h-5" />
              {labels.save}
            </button>
            <button onClick={resetForm}
              className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Liste des liens */}
      {!links?.length ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-cream-dark">
          <Video className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <p className="text-indigo-600">{labels.noLinks}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map(link => (
            <div key={link.id} className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-950 font-serif">{link.titre}</h3>
                    {link.meetingId && (
                      <div className="text-sm text-indigo-600">
                        {labels.meetingIdLabel} : {link.meetingId}
                      </div>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(link)}
                      className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 active:bg-indigo-300 transition-colors cursor-pointer">
                      <Pencil className="w-4 h-4 text-indigo-700" />
                    </button>
                    <button onClick={() => handleDelete(link.id!)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300 transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors no-underline"
              >
                <Video className="w-5 h-5" />
                {labels.join}
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleCopy(link.id!, link.url)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 active:bg-indigo-200 transition-colors cursor-pointer"
              >
                {copied === link.id ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">{labels.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {labels.copyLink}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-indigo-400 italic text-center">{labels.tip}</p>
    </div>
  )
}
