import { dataService } from '../lib/dataService'
import { markBackupDone } from '../components/BackupReminder'

export async function exportBackup() {
  const services = await dataService.getServices()
  const annonces = await dataService.getAnnonces()
  const departements = await dataService.getDepartements()

  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    app: 'Royal Ministry of All Nations',
    services,
    annonces,
    departements,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `royal-ministry-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  markBackupDone()
}

export async function clearAllData() {
  await dataService.clearAllData()
}
