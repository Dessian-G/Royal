import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { useEffect } from 'react'
import { seedDepartements } from './db/database'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Presences from './pages/Presences'
import Annonces from './pages/Annonces'
import Departements from './pages/Departements'
import DepartementDetail from './pages/DepartementDetail'
import Statistiques from './pages/Statistiques'
import RapportMensuel from './pages/RapportMensuel'
import Parametres from './pages/Parametres'

function AppContent() {
  useEffect(() => {
    seedDepartements()
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="pb-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/presences" element={<Presences />} />
          <Route path="/annonces" element={<Annonces />} />
          <Route path="/departements" element={<Departements />} />
          <Route path="/departements/:cle" element={<DepartementDetail />} />
          <Route path="/statistiques" element={<Statistiques />} />
          <Route path="/rapport" element={<RapportMensuel />} />
          <Route path="/parametres" element={<Parametres />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </BrowserRouter>
  )
}
