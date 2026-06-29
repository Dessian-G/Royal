import { supabase } from './supabase'

// --- Types avec noms snake_case (Supabase) ---

export interface DbService {
  id?: string
  date: string
  adultes_hommes: number
  adultes_femmes: number
  enfants_garcons: number
  enfants_filles: number
  dirigeant: string
  predicateur: string
  theme_message: string
  texte_biblique: string
  resume_message?: string | null
  offrandes?: number | null
  dimes?: number | null
  autres_dons?: number | null
  devise: string
  note_finances?: string | null
  saisi_par?: string | null
  created_at?: string
}

export interface DbAnnonce {
  id?: string
  date: string
  titre: string
  contenu: string
  departement?: string | null
  created_at?: string
}

export interface DbDepartement {
  id?: string
  cle: string
  nom: string
  responsable: string
  contact_responsable?: string | null
  description?: string | null
  nombre_membres?: number | null
  activites?: string | null
  updated_at?: string
}

export interface DbUser {
  id?: string
  username: string
  password_hash: string
  nom: string
  role: 'admin' | 'user'
  created_at?: string
}

export interface DbZoomLink {
  id?: string
  titre: string
  url: string
  meeting_id?: string | null
  created_at?: string
}

// --- Helpers ---

export function getTotalPresents(s: DbService): number {
  return s.adultes_hommes + s.adultes_femmes + s.enfants_garcons + s.enfants_filles
}

export function getTotalAdultes(s: DbService): number {
  return s.adultes_hommes + s.adultes_femmes
}

export function getTotalEnfants(s: DbService): number {
  return s.enfants_garcons + s.enfants_filles
}

export function getTotalFinances(s: DbService): number {
  return (s.offrandes || 0) + (s.dimes || 0) + (s.autres_dons || 0)
}

// --- Services ---

export const dataService = {
  // Services
  async getServices(): Promise<DbService[]> {
    const { data } = await supabase.from('services').select('*').order('date', { ascending: false })
    return data || []
  },

  async getServiceByDate(date: string): Promise<DbService | null> {
    const { data } = await supabase.from('services').select('*').eq('date', date).maybeSingle()
    return data
  },

  async addService(service: Omit<DbService, 'id' | 'created_at'>): Promise<void> {
    await supabase.from('services').insert(service)
  },

  async updateService(id: string, service: Partial<DbService>): Promise<void> {
    await supabase.from('services').update(service).eq('id', id)
  },

  async deleteService(id: string): Promise<void> {
    await supabase.from('services').delete().eq('id', id)
  },

  // Annonces
  async getAnnonces(): Promise<DbAnnonce[]> {
    const { data } = await supabase.from('annonces').select('*').order('date', { ascending: false })
    return data || []
  },

  async addAnnonce(annonce: Omit<DbAnnonce, 'id' | 'created_at'>): Promise<void> {
    await supabase.from('annonces').insert(annonce)
  },

  async updateAnnonce(id: string, annonce: Partial<DbAnnonce>): Promise<void> {
    await supabase.from('annonces').update(annonce).eq('id', id)
  },

  async deleteAnnonce(id: string): Promise<void> {
    await supabase.from('annonces').delete().eq('id', id)
  },

  // Départements
  async getDepartements(): Promise<DbDepartement[]> {
    const { data } = await supabase.from('departements').select('*')
    return data || []
  },

  async getDepartementByCle(cle: string): Promise<DbDepartement | null> {
    const { data } = await supabase.from('departements').select('*').eq('cle', cle).maybeSingle()
    return data
  },

  async updateDepartement(id: string, dep: Partial<DbDepartement>): Promise<void> {
    await supabase.from('departements').update({ ...dep, updated_at: new Date().toISOString() }).eq('id', id)
  },

  // Users
  async getUsers(): Promise<DbUser[]> {
    const { data } = await supabase.from('app_users').select('*').order('created_at')
    return data || []
  },

  async getUserByUsername(username: string): Promise<DbUser | null> {
    const { data } = await supabase.from('app_users').select('*').eq('username', username).maybeSingle()
    return data
  },

  async addUser(user: Omit<DbUser, 'id' | 'created_at'>): Promise<void> {
    await supabase.from('app_users').insert(user)
  },

  async updateUserPassword(id: string, passwordHash: string): Promise<void> {
    await supabase.from('app_users').update({ password_hash: passwordHash }).eq('id', id)
  },

  async deleteUser(id: string): Promise<void> {
    await supabase.from('app_users').delete().eq('id', id)
  },

  // Zoom Links
  async getZoomLinks(): Promise<DbZoomLink[]> {
    const { data } = await supabase.from('zoom_links').select('*').order('created_at')
    return data || []
  },

  async addZoomLink(link: Omit<DbZoomLink, 'id' | 'created_at'>): Promise<void> {
    await supabase.from('zoom_links').insert(link)
  },

  async updateZoomLink(id: string, link: Partial<DbZoomLink>): Promise<void> {
    await supabase.from('zoom_links').update(link).eq('id', id)
  },

  async deleteZoomLink(id: string): Promise<void> {
    await supabase.from('zoom_links').delete().eq('id', id)
  },

  // Bulk operations
  async clearAllData(): Promise<void> {
    await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('annonces').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  },
}
