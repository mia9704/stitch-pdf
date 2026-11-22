import { parseAdsensePublisherId } from '../../adsenseIds'

const ADSENSE_SCRIPT_PATH = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'

export function getAdsenseClientId(): string | undefined {
  const raw = import.meta.env.VITE_ADSENSE_CLIENT_ID?.trim()
  if (!raw) return undefined
  try {
    return parseAdsensePublisherId(raw).clientId
  } catch {
    return undefined
  }
}

function adsenseScriptSrc(clientId: string): string {
  return `https://${ADSENSE_SCRIPT_PATH}?client=${encodeURIComponent(clientId)}`
}

function hasCorrectAdsenseScript(clientId: string): boolean {
  const want = adsenseScriptSrc(clientId)
  for (const el of document.querySelectorAll('script[src*="adsbygoogle.js"]')) {
    if (el.getAttribute('src') === want) return true
  }
  return false
}

/** Remove tags Google rejected (e.g. `client=pub-…` instead of `client=ca-pub-…`). */
function removeIncorrectAdsenseScripts(clientId: string): void {
  const want = adsenseScriptSrc(clientId)
  for (const el of document.querySelectorAll('script[src*="adsbygoogle.js"]')) {
    if (el.getAttribute('src') !== want) el.remove()
  }
}

/** Loads the AdSense script for site-level Auto ads (configured in AdSense → Ads → By site). */
export function loadAdsenseAutoAds(clientId: string): void {
  if (typeof document === 'undefined') return

  removeIncorrectAdsenseScripts(clientId)
  if (hasCorrectAdsenseScript(clientId)) return

  const script = document.createElement('script')
  script.async = true
  script.src = adsenseScriptSrc(clientId)
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}