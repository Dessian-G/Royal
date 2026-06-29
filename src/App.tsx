import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { useEffect } from 'react'
import { seedDepartements, seedAdmin } from './db/database'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Presences from './pages/Presences'
import Annonces from './pages/Annonces'
import Departements from './pages/Departements'
import DepartementDetail from './pages/DepartementDetail'
import Statistiques from './pages/Statistiques'
import RapportMensuel from './pages/RapportMensuel'
import Parametres from './pages/Parametres'
import GestionUtilisateurs from './pages/GestionUtilisateurs'

function AppContent() {
  const { isLoggedIn, isAdmin } = useAuth()

  useEffect(() => {
    seedDepartements()
    seedAdmin()
  }, [])

  if (!isLoggedIn) {
    return <Login />
  }

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
          <Route path="/parametres" element={isAdmin ? <Parametres /> : <Navigate to="/" />} />
          <Route path="/utilisateurs" element={isAdmin ? <GestionUtilisateurs /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
