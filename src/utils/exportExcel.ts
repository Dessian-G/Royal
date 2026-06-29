import * as XLSX from 'xlsx'
import { type Service, getTotalPresents, getTotalFinances } from '../db/database'

export function exportServicesToExcel(services: Service[]) {
  const data = services.map(s => ({
    Date: s.date,
    'Adultes Hommes': s.adultesHommes,
    'Adultes Femmes': s.adultesFemmes,
    'Enfants Garçons': s.enfantsGarcons,
    'Enfants Filles': s.enfantsFilles,
    'Total Présents': getTotalPresents(s),
    Dirigeant: s.dirigeant,
    Prédicateur: s.predicateur,
    'Thème': s.themeMessage,
    'Texte biblique': s.texteBiblique,
    Offrandes: s.offrandes || 0,
    Dîmes: s.dimes || 0,
    'Autres dons': s.autresDons || 0,
    'Total Finances': getTotalFinances(s),
    Devise: s.devise,
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)

  const colWidths = [
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 13 },
    { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 18 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 8 },
  ]
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Services')
  XLSX.writeFile(wb, 'royal-ministry-services.xlsx')
}
