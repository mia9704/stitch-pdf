import { useEffect, useRef } from 'react'
import { getAdsenseClientId, getAdsenseSlot, loadAdsenseScript } from '../lib/adsense'
import './GoogleAd.css'

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[]
  }
}

export function GoogleAd() {
  const clientId = getAdsenseClientId()
  const slot = getAdsenseSlot()
  const pushed = useRef(false)

  useEffect(() => {
    if (!clientId) return
    loadAdsenseScript(clientId)
  }, [clientId])

  useEffect(() => {
    if (!clientId || !slot || pushed.current) return
    pushed.current = true
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch {
      /* blocked or script not ready */
    }
  }, [clientId, slot])

  if (!clientId || !slot) return null

  return (
    <aside className="ad-slot" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
