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

export type UserRole = 'admin' | 'user'

export interface AppUser {
  id?: number
  username: string
  passwordHash: string
  nom: string
  role: UserRole
  createdAt: string
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password)
  return computed === hash
}

export async function createPasswordHash(password: string): Promise<string> {
  return hashPassword(password)
}

export class AppDatabase extends Dexie {
  services!: Table<Service>
  annonces!: Table<Annonce>
  departements!: Table<Departement>
  users!: Table<AppUser>

  constructor() {
    super('RoyalMinistryDB')
    this.version(1).stores({
      services: '++id, &date',
      annonces: '++id, date',
      departements: '++id, &cle'
    })
    this.version(2).stores({
      services: '++id, &date',
      annonces: '++id, date',
      departements: '++id, &cle',
      users: '++id, &username'
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

export async function seedAdmin() {
  const count = await db.users.count()
  if (count === 0) {
    const hash = await createPasswordHash('admin')
    await db.users.add({
      username: 'admin',
      passwordHash: hash,
      nom: 'Administrateur',
      role: 'admin',
      createdAt: new Date().toISOString()
    })
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
