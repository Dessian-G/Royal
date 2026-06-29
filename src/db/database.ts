import Dexie, { type Table } from 'dexie'

export interface Service {
  id?: number
  date: string
  adultesHommes: number
  adultesFemmes: number
  enfantsGarcons: number
  enfantsFilles: number
  dirigeant: string
  predicateur: string
  themeMessage: string
  texteBiblique: string
  resumeMessage?: string
  offrandes?: number
  dimes?: number
  autresDons?: number
  devise: string
  noteFinances?: string
  saisiPar?: string
  createdAt: string
}

export interface Annonce {
  id?: number
  date: string
  titre: string
  contenu: string
  departement?: string
  createdAt: string
}

export interface Departement {
  id?: number
  cle: 'enfants' | 'jeunes' | 'femmes' | 'groupe_musical'
  nom: string
  responsable: string
  contactResponsable?: string
  description?: string
  nombreMembres?: number
  activites?: string
  updatedAt: string
}

export class AppDatabase extends Dexie {
  services!: Table<Service>
  annonces!: Table<Annonce>
  departements!: Table<Departement>

  constructor() {
    super('RoyalMinistryDB')
    this.version(1).stores({
      services: '++id, &date',
      annonces: '++id, date',
      departements: '++id, &cle'
    })
  }
}

export const db = new AppDatabase()

export async function seedDepartements() {
  const count = await db.departements.count()
  if (count === 0) {
    const now = new Date().toISOString()
    await db.departements.bulkAdd([
      { cle: 'enfants', nom: 'Enfants', responsable: '', updatedAt: now },
      { cle: 'jeunes', nom: 'Jeunes', responsable: '', updatedAt: now },
      { cle: 'femmes', nom: 'Femmes', responsable: '', updatedAt: now },
      { cle: 'groupe_musical', nom: 'Groupe Musical', responsable: '', updatedAt: now }
    ])
  }
}

export function getTotalPresents(s: Service): number {
  return s.adultesHommes + s.adultesFemmes + s.enfantsGarcons + s.enfantsFilles
}

export function getTotalAdultes(s: Service): number {
  return s.adultesHommes + s.adultesFemmes
}

export function getTotalEnfants(s: Service): number {
  return s.enfantsGarcons + s.enfantsFilles
}

export function getTotalFinances(s: Service): number {
  return (s.offrandes || 0) + (s.dimes || 0) + (s.autresDons || 0)
}
