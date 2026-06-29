import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useLanguage } from '../i18n/LanguageContext'
import { exportBackup, importBackup, clearAllData } from '../utils/backup'
import { generateAllServicesPdf } from '../utils/exportPdf'
import { exportServicesToExcel } from '../utils/exportExcel'
import {
  Download, Upload, FileText, Table, Trash2,
  Globe, CheckCircle, AlertTriangle
} from 'lucide-react'

export default function Parametres() {
  const { lang, t, toggleLang } = useLanguage()
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const fileRef = useRef<HTMLInputElement>(null)

  const services = useLiveQuery(() => db.services.orderBy('date').toArray())

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast(msg)
    setToastType(type)
  }

  async function handleExportJson() {
    await exportBackup()
  }

  async function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm(t.parametres.importConfirm)) {
      e.target.value = ''
      return
    }

    const ok = await importBackup(file)
    showToast(ok ? t.parametres.importSuccess : t.parametres.importError, ok ? 'success' : 'error')
    e.target.value = ''
  }

  function handleExportPdf() {
    if (!services?.length) return
    generateAllServicesPdf(services)
  }

  function handleExportExcel() {
    if (!services?.length) return
    exportServicesToExcel(services)
  }

  async function handleClearAll() {
    if (!confirm(t.parametres.effacerConfirm1)) return
    if (!confirm(t.parametres.effacerConfirm2)) return
    await clearAllData()
    showToast(t.parametres.effacerSuccess)
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-950">{t.parametres.title}</h1>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
          toastType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {toastType === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast}
        </div>
      )}

      {/* Langue */}
      <Section title={t.parametres.langue} icon={Globe}>
        <div className="flex items-center gap-3">
          <span className="text-sm text-indigo-700">Français / English</span>
          <button onClick={toggleLang}
            className="px-4 py-2 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-colors cursor-pointer">
            {lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
          </button>
        </div>
      </Section>

      {/* Sauvegarde */}
      <Section title={t.parametres.sauvegarde} icon={Download}>
        <div className="space-y-3">
          <ActionButton icon={Download} label={t.parametres.exportJson} onClick={handleExportJson} variant="gold" />
          <ActionButton icon={Upload} label={t.parametres.importJson} onClick={() => fileRef.current?.click()} variant="outline" />
          <input ref={fileRef} type="file" accept=".json" onChange={handleImportJson} className="hidden" />
        </div>
      </Section>

      {/* Rapports */}
      <Section title={t.parametres.rapports} icon={FileText}>
        <div className="space-y-3">
          <ActionButton icon={FileText} label={t.parametres.exportPdf} onClick={handleExportPdf}
            disabled={!services?.length} variant="primary" />
          <ActionButton icon={Table} label={t.parametres.exportExcel} onClick={handleExportExcel}
            disabled={!services?.length} variant="primary" />
        </div>
      </Section>

      {/* Danger zone */}
      <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-red-800 font-serif">{t.parametres.effacer}</h2>
        </div>
        <button onClick={handleClearAll}
          className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer">
          {t.parametres.effacer}
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Download; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-indigo-700" />
        <h2 className="text-lg font-bold text-indigo-950 font-serif">{title}</h2>
      </div>
      {children}
    </div>
  )
}

interface ActionButtonProps {
  icon: typeof Download
  label: string
  onClick: () => void
  variant?: 'primary' | 'gold' | 'outline'
  disabled?: boolean
}

function ActionButton({ icon: Icon, label, onClick, variant = 'primary', disabled }: ActionButtonProps) {
  const styles = {
    primary: 'bg-indigo-900 text-white hover:bg-indigo-800',
    gold: 'bg-gold text-indigo-950 hover:bg-gold-light',
    outline: 'bg-white text-indigo-900 border-2 border-indigo-200 hover:border-indigo-400',
  }

  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-40 ${styles[variant]}`}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  )
}
