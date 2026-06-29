import { useState, useEffect } from 'react'
import { dataService } from '../lib/dataService'
import { useCollection } from '../lib/useCollection'
import { useLanguage } from '../i18n/LanguageContext'
import { exportBackup, clearAllData } from '../utils/backup'
import { generateAllServicesPdf } from '../utils/exportPdf'
import { exportServicesToExcel } from '../utils/exportExcel'
import { Download, FileText, Table, Trash2, Globe, CheckCircle, AlertTriangle } from 'lucide-react'

export default function Parametres() {
  const { lang, t, toggleLang } = useLanguage()
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const { data: services } = useCollection(() => dataService.getServices())

  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer) } }, [toast])

  function showToast(msg: string, type: 'success' | 'error' = 'success') { setToast(msg); setToastType(type) }

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
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${toastType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {toastType === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast}
        </div>
      )}

      <Section title={t.parametres.langue} icon={Globe}>
        <div className="flex items-center gap-3">
          <span className="text-sm text-indigo-700">Français / English</span>
          <button onClick={toggleLang} className="px-4 py-2 bg-indigo-900 text-white rounded-xl font-semibold hover:bg-indigo-800 transition-colors cursor-pointer">
            {lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
          </button>
        </div>
      </Section>

      <Section title={t.parametres.sauvegarde} icon={Download}>
        <ActionButton icon={Download} label={t.parametres.exportJson} onClick={() => exportBackup()} variant="gold" />
      </Section>

      <Section title={t.parametres.rapports} icon={FileText}>
        <div className="space-y-3">
          <ActionButton icon={FileText} label={t.parametres.exportPdf} onClick={() => services.length && generateAllServicesPdf(services)} disabled={!services.length} variant="primary" />
          <ActionButton icon={Table} label={t.parametres.exportExcel} onClick={() => services.length && exportServicesToExcel(services)} disabled={!services.length} variant="primary" />
        </div>
      </Section>

      <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
        <div className="flex items-center gap-2 mb-3"><Trash2 className="w-5 h-5 text-red-600" /><h2 className="text-lg font-bold text-red-800 font-serif">{t.parametres.effacer}</h2></div>
        <button onClick={handleClearAll} className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer">{t.parametres.effacer}</button>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Download; children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark"><div className="flex items-center gap-2 mb-4"><Icon className="w-5 h-5 text-indigo-700" /><h2 className="text-lg font-bold text-indigo-950 font-serif">{title}</h2></div>{children}</div>
}

function ActionButton({ icon: Icon, label, onClick, variant = 'primary', disabled }: { icon: typeof Download; label: string; onClick: () => void; variant?: 'primary' | 'gold'; disabled?: boolean }) {
  const styles = { primary: 'bg-indigo-900 text-white hover:bg-indigo-800', gold: 'bg-gold text-indigo-950 hover:bg-gold-light' }
  return <button onClick={onClick} disabled={disabled} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-40 ${styles[variant]}`}><Icon className="w-5 h-5" />{label}</button>
}
