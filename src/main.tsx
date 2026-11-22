import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { getAdsenseClientId, loadAdsenseAutoAds } from './lib/adsense'
import './index.css'

const adsenseClientId = getAdsenseClientId()
if (adsenseClientId) {
  loadAdsenseAutoAds(adsenseClientId)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
