import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { type Service, getTotalPresents, getTotalFinances } from '../db/database'

export function generateMonthlyPdf(
  services: Service[],
  moisNom: string,
  annee: number,
  t: Record<string, any>
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // En-tête
  doc.setFillColor(30, 27, 75) // indigo-950
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(212, 175, 55) // gold
  doc.setFontSize(16)
  doc.text('ROYAL MINISTRY OF ALL NATIONS', pageWidth / 2, 15, { align: 'center' })

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text(`${t.rapport.title} — ${moisNom} ${annee}`, pageWidth / 2, 27, { align: 'center' })

  let y = 45

  // Tableau des services
  const tableData = services.map(s => [
    new Date(s.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    s.adultesHommes.toString(),
    s.adultesFemmes.toString(),
    s.enfantsGarcons.toString(),
    s.enfantsFilles.toString(),
    getTotalPresents(s).toString(),
    s.predicateur || '',
    s.themeMessage || '',
  ])

  autoTable(doc, {
    startY: y,
    head: [['Date', 'H.Ad', 'F.Ad', 'Garç.', 'Filles', 'Total', t.statistiques.predicateur, t.statistiques.theme]],
    body: tableData,
    headStyles: { fillColor: [30, 27, 75], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [250, 247, 242] },
    columnStyles: {
      0: { cellWidth: 18 },
      5: { fontStyle: 'bold' },
      6: { cellWidth: 25 },
      7: { cellWidth: 35 },
    },
    margin: { left: 10, right: 10 },
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // Synthèse présences
  const totalPresents = services.reduce((s, sv) => s + getTotalPresents(sv), 0)
  const moy = services.length ? Math.round(totalPresents / services.length) : 0

  doc.setFontSize(11)
  doc.setTextColor(30, 27, 75)
  doc.text(`${t.rapport.presences}`, 10, y)
  y += 7
  doc.setFontSize(9)
  doc.text(`${t.rapport.nbDimanches}: ${services.length}    |    ${t.rapport.totalGeneral}: ${totalPresents}    |    ${t.rapport.moyenne}: ${moy}`, 10, y)
  y += 10

  // Synthèse finances
  const totalOff = services.reduce((s, sv) => s + (sv.offrandes || 0), 0)
  const totalDim = services.reduce((s, sv) => s + (sv.dimes || 0), 0)
  const totalAut = services.reduce((s, sv) => s + (sv.autresDons || 0), 0)
  const totalCol = totalOff + totalDim + totalAut
  const devise = services[0]?.devise || 'FCFA'

  doc.setFontSize(11)
  doc.text(`${t.rapport.finances}`, 10, y)
  y += 7
  doc.setFontSize(9)

  const financeData = [
    [`${t.rapport.totalOffrandes}: ${totalOff.toLocaleString()} ${devise}`],
    [`${t.rapport.totalDimes}: ${totalDim.toLocaleString()} ${devise}`],
    [`${t.rapport.totalAutresDons}: ${totalAut.toLocaleString()} ${devise}`],
    [`${t.rapport.totalCollecte}: ${totalCol.toLocaleString()} ${devise}`],
  ]

  autoTable(doc, {
    startY: y,
    body: financeData,
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [250, 247, 242] },
    margin: { left: 10, right: 10 },
    theme: 'plain',
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // Messages
  if (y > 250) { doc.addPage(); y = 20 }

  doc.setFontSize(11)
  doc.setTextColor(30, 27, 75)
  doc.text(`${t.rapport.messages}`, 10, y)
  y += 7

  doc.setFontSize(8)
  services.forEach(s => {
    if (y > 275) { doc.addPage(); y = 20 }
    if (s.themeMessage) {
      doc.text(`• ${s.themeMessage}${s.texteBiblique ? ` (${s.texteBiblique})` : ''}`, 12, y)
      y += 5
    }
  })

  // Pied de page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(120)
    doc.text(
      `Royal Ministry of All Nations — ${new Date().toLocaleDateString('fr-FR')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  doc.save(`rapport-${moisNom.toLowerCase()}-${annee}.pdf`)
}

export function generateAllServicesPdf(services: Service[]) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(30, 27, 75)
  doc.rect(0, 0, pageWidth, 30, 'F')
  doc.setTextColor(212, 175, 55)
  doc.setFontSize(14)
  doc.text('ROYAL MINISTRY OF ALL NATIONS', pageWidth / 2, 12, { align: 'center' })
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('Historique des services', pageWidth / 2, 23, { align: 'center' })

  const tableData = services.map(s => [
    new Date(s.date + 'T00:00:00').toLocaleDateString('fr-FR'),
    getTotalPresents(s).toString(),
    s.predicateur || '',
    s.themeMessage || '',
    `${getTotalFinances(s).toLocaleString()} ${s.devise}`,
  ])

  autoTable(doc, {
    startY: 38,
    head: [['Date', 'Présents', 'Prédicateur', 'Thème', 'Finances']],
    body: tableData,
    headStyles: { fillColor: [30, 27, 75], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 247, 242] },
    margin: { left: 10, right: 10 },
  })

  doc.save('historique-services.pdf')
}
