const SCRIPT_ATTR = 'data-stitch-adsense'

export function getAdsenseClientId(): string | undefined {
  const id = import.meta.env.VITE_ADSENSE_CLIENT_ID?.trim()
  return id || undefined
}

export function getAdsenseSlot(): string | undefined {
  const slot = import.meta.env.VITE_ADSENSE_SLOT?.trim()
  return slot || undefined
}

export function isAdsenseConfigured(): boolean {
  return Boolean(getAdsenseClientId() && getAdsenseSlot())
}

export function loadAdsenseScript(clientId: string): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`script[${SCRIPT_ATTR}]`)) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`
  script.crossOrigin = 'anonymous'
  script.setAttribute(SCRIPT_ATTR, 'true')
  document.head.appendChild(script)
}
