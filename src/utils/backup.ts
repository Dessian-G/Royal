import { db } from '../db/database'
import { markBackupDone } from '../components/BackupReminder'

export async function exportBackup() {
  const services = await db.services.toArray()
  const annonces = await db.annonces.toArray()
  const departements = await db.departements.toArray()

  const data = {
    version: 1,
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

export async function importBackup(file: File): Promise<boolean> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!data.services || !data.annonces || !data.departements) {
      throw new Error('Format invalide')
    }

    await db.transaction('rw', db.services, db.annonces, db.departements, async () => {
      await db.services.clear()
      await db.annonces.clear()
      await db.departements.clear()

      if (data.services.length) {
        const cleaned = data.services.map(({ id, ...rest }: any) => rest)
        await db.services.bulkAdd(cleaned)
      }
      if (data.annonces.length) {
        const cleaned = data.annonces.map(({ id, ...rest }: any) => rest)
        await db.annonces.bulkAdd(cleaned)
      }
      if (data.departements.length) {
        const cleaned = data.departements.map(({ id, ...rest }: any) => rest)
        await db.departements.bulkAdd(cleaned)
      }
    })

    return true
  } catch {
    return false
  }
}

export async function clearAllData() {
  await db.transaction('rw', db.services, db.annonces, db.departements, async () => {
    await db.services.clear()
    await db.annonces.clear()
    await db.departements.clear()
  })
  const { seedDepartements } = await import('../db/database')
  await seedDepartements()
}
