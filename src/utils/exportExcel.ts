import * as XLSX from 'xlsx'
import { type DbService, getTotalPresents, getTotalFinances } from '../lib/dataService'

export function exportServicesToExcel(services: DbService[]) {
  const data = services.map(s => ({
    Date: s.date,
    'Adultes Hommes': s.adultes_hommes,
    'Adultes Femmes': s.adultes_femmes,
    'Enfants Garçons': s.enfants_garcons,
    'Enfants Filles': s.enfants_filles,
    'Total Présents': getTotalPresents(s),
    Dirigeant: s.dirigeant,
    Prédicateur: s.predicateur,
    'Thème': s.theme_message,
    'Texte biblique': s.texte_biblique,
    Offrandes: s.offrandes || 0,
    Dîmes: s.dimes || 0,
    'Autres dons': s.autres_dons || 0,
    'Total Finances': getTotalFinances(s),
    Devise: s.devise,
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 13 },
    { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 18 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 8 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Services')
  XLSX.writeFile(wb, 'royal-ministry-services.xlsx')
}
