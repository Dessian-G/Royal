import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { fr } from './fr'
import { en } from './en'

type Translations = typeof fr
type Lang = 'fr' | 'en'

interface LanguageContextType {
  lang: Lang
  t: Translations
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const translations: Record<Lang, Translations> = { fr, en }

function getSavedLang(): Lang {
  const saved = localStorage.getItem('rm-lang')
  return saved === 'en' ? 'en' : 'fr'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getSavedLang)

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'fr' ? 'en' : 'fr'
      localStorage.setItem('rm-lang', next)
      return next
    })
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider')
  return ctx
}
