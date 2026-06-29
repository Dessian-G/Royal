import { useLanguage } from '../i18n/LanguageContext'
import { Video, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const ZOOM_LINK = 'https://us02web.zoom.us/j/84214624356?pwd=UkU0SDJJQ1lXOWtGR29BUjlJWWJ5Zz09'
const MEETING_ID = '842 1462 4356'

export default function Zoom() {
  const { lang } = useLanguage()
  const [copied, setCopied] = useState(false)

  const labels = lang === 'fr' ? {
    title: 'Réunion Zoom',
    subtitle: 'Rejoignez le culte en ligne',
    join: 'Rejoindre la réunion',
    meetingId: 'ID de réunion',
    copyLink: 'Copier le lien',
    copied: 'Lien copié !',
    instructions: 'Cliquez sur le bouton ci-dessous pour rejoindre la réunion Zoom de l\'église.',
    tip: 'Astuce : installez l\'application Zoom sur votre téléphone pour une meilleure expérience.',
  } : {
    title: 'Zoom Meeting',
    subtitle: 'Join the online service',
    join: 'Join meeting',
    meetingId: 'Meeting ID',
    copyLink: 'Copy link',
    copied: 'Link copied!',
    instructions: 'Click the button below to join the church Zoom meeting.',
    tip: 'Tip: install the Zoom app on your phone for a better experience.',
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(ZOOM_LINK)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-950">{labels.title}</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-dark text-center space-y-5">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Video className="w-10 h-10 text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-indigo-950 font-serif">{labels.subtitle}</h2>
          <p className="text-sm text-indigo-600 mt-2">{labels.instructions}</p>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4">
          <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">{labels.meetingId}</span>
          <div className="text-lg font-bold text-indigo-950 mt-1">{MEETING_ID}</div>
        </div>

        <a
          href={ZOOM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 active:bg-blue-800 transition-colors no-underline"
        >
          <Video className="w-6 h-6" />
          {labels.join}
          <ExternalLink className="w-5 h-5" />
        </a>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-100 text-indigo-800 rounded-xl font-semibold hover:bg-indigo-200 active:bg-indigo-300 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">{labels.copied}</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              {labels.copyLink}
            </>
          )}
        </button>

        <p className="text-xs text-indigo-400 italic">{labels.tip}</p>
      </div>
    </div>
  )
}
