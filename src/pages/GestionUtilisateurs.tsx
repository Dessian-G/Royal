import { useState, useEffect } from 'react'
import { dataService } from '../lib/dataService'
import { useCollection } from '../lib/useCollection'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth, createPasswordHash } from '../auth/AuthContext'
import { UserPlus, Trash2, Shield, User, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react'

export default function GestionUtilisateurs() {
  const { lang } = useLanguage()
  const { user: currentUser } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [resetId, setResetId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const { data: users, refresh } = useCollection(() => dataService.getUsers())

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t) } }, [toast])

  const labels = lang === 'fr' ? {
    title: 'Gestion des utilisateurs', addUser: 'Ajouter un utilisateur', username: "Nom d'utilisateur",
    password: 'Mot de passe', nom: 'Nom complet', role: 'Rôle', admin: 'Administrateur', user: 'Utilisateur',
    save: 'Créer', cancel: 'Annuler', delete: 'Supprimer', deleteConfirm: 'Supprimer cet utilisateur ?',
    cantDeleteSelf: 'Vous ne pouvez pas supprimer votre propre compte.', userCreated: 'Utilisateur créé !',
    userDeleted: 'Utilisateur supprimé.', usernameExists: "Ce nom d'utilisateur existe déjà.",
    resetPassword: 'Réinitialiser le mot de passe', newPassword: 'Nouveau mot de passe', resetDone: 'Mot de passe réinitialisé !',
  } : {
    title: 'User Management', addUser: 'Add user', username: 'Username',
    password: 'Password', nom: 'Full name', role: 'Role', admin: 'Administrator', user: 'User',
    save: 'Create', cancel: 'Cancel', delete: 'Delete', deleteConfirm: 'Delete this user?',
    cantDeleteSelf: 'You cannot delete your own account.', userCreated: 'User created!',
    userDeleted: 'User deleted.', usernameExists: 'This username already exists.',
    resetPassword: 'Reset password', newPassword: 'New password', resetDone: 'Password reset!',
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') { setToast(msg); setToastType(type) }

  async function handleCreate() {
    if (!username.trim() || !password || !nom.trim()) return
    const existing = await dataService.getUserByUsername(username.trim().toLowerCase())
    if (existing) { showToast(labels.usernameExists, 'error'); return }
    const hash = await createPasswordHash(password)
    await dataService.addUser({ username: username.trim().toLowerCase(), password_hash: hash, nom: nom.trim(), role })
    showToast(labels.userCreated)
    setUsername(''); setPassword(''); setNom(''); setRole('user'); setShowForm(false); refresh()
  }

  async function handleDelete(id: string) {
    if (id === currentUser?.id) { showToast(labels.cantDeleteSelf, 'error'); return }
    if (!confirm(labels.deleteConfirm)) return
    await dataService.deleteUser(id); showToast(labels.userDeleted); refresh()
  }

  async function handleResetPassword() {
    if (!resetId || !newPassword) return
    const hash = await createPasswordHash(newPassword)
    await dataService.updateUserPassword(resetId, hash)
    showToast(labels.resetDone); setResetId(null); setNewPassword('')
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-950">{labels.title}</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gold text-indigo-950 rounded-xl font-semibold hover:bg-gold-light transition-colors cursor-pointer">
            <UserPlus className="w-4 h-4" />{labels.addUser}
          </button>
        )}
      </div>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${toastType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {toastType === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark space-y-4">
          <div><label className="block text-sm font-medium text-indigo-800 mb-1">{labels.nom}</label>
            <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-indigo-800 mb-1">{labels.username}</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-indigo-800 mb-1">{labels.password}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-indigo-800 mb-1">{labels.role}</label>
            <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')} className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:outline-none">
              <option value="user">{labels.user}</option><option value="admin">{labels.admin}</option>
            </select></div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={!username.trim() || !password || !nom.trim()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 disabled:opacity-40 transition-colors cursor-pointer"><UserPlus className="w-5 h-5" />{labels.save}</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer">{labels.cancel}</button>
          </div>
        </div>
      )}

      {resetId && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gold/30 space-y-4">
          <h3 className="font-semibold text-indigo-950 flex items-center gap-2"><KeyRound className="w-5 h-5 text-gold" />{labels.resetPassword}</h3>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={labels.newPassword} autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none" />
          <div className="flex gap-3">
            <button onClick={handleResetPassword} disabled={!newPassword} className="flex-1 py-3 bg-gold text-indigo-950 rounded-xl font-semibold hover:bg-gold-light disabled:opacity-40 transition-colors cursor-pointer">{labels.resetPassword}</button>
            <button onClick={() => { setResetId(null); setNewPassword('') }} className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors cursor-pointer">{labels.cancel}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm border border-cream-dark flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${u.role === 'admin' ? 'bg-gold/20 text-gold' : 'bg-indigo-100 text-indigo-600'}`}>
                {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-indigo-950 truncate">{u.nom}</div>
                <div className="text-sm text-indigo-600">@{u.username} · {u.role === 'admin' ? labels.admin : labels.user}</div>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { setResetId(u.id!); setNewPassword('') }} className="p-2 bg-gold/10 rounded-lg hover:bg-gold/20 active:bg-gold/30 transition-colors cursor-pointer" title={labels.resetPassword}>
                <KeyRound className="w-4 h-4 text-gold" />
              </button>
              {u.id !== currentUser?.id && (
                <button onClick={() => handleDelete(u.id!)} className="p-2 bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300 transition-colors cursor-pointer" title={labels.delete}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
