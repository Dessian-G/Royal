import { useLanguage } from '../i18n/LanguageContext'
import { AlertTriangle, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const BACKUP_KEY = 'rm-last-backup'
const DISMISS_KEY = 'rm-backup-dismissed'
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export function markBackupDone() {
  localStorage.setItem(BACKUP_KEY, new Date().toISOString())
}

export default function BackupReminder() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) {
      const dismissedAt = new Date(dismissed).getTime()
      if (Date.now() - dismissedAt < SEVEN_DAYS) return
    }
    const lastBackup = localStorage.getItem(BACKUP_KEY)
    if (!lastBackup) {
      setVisible(true)
      return
    }
    const elapsed = Date.now() - new Date(lastBackup).getTime()
    if (elapsed > SEVEN_DAYS) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="bg-gold/15 border border-gold/40 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-indigo-950">{t.dashboard.backupReminder}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => navigate('/parametres')}
            className="text-xs font-semibold px-3 py-1.5 bg-gold text-indigo-950 rounded-lg hover:bg-gold-light transition-colors cursor-pointer"
          >
            {t.dashboard.exportNow}
          </button>
          <button
            onClick={() => {
              localStorage.setItem(DISMISS_KEY, new Date().toISOString())
              setVisible(false)
            }}
            className="text-xs px-3 py-1.5 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            {t.dashboard.dismiss}
          </button>
        </div>
      </div>
      <button onClick={() => setVisible(false)} className="text-indigo-400 hover:text-indigo-700 cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
