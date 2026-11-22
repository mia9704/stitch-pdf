/** Normalize AdSense IDs from env (`ca-pub-…` or `pub-…`). */
export function parseAdsensePublisherId(raw: string) {
  const numeric = raw.trim().replace(/^ca-pub-/, '').replace(/^pub-/, '')
  if (!numeric) {
    throw new Error('Invalid VITE_ADSENSE_CLIENT_ID')
  }
  return {
    clientId: `ca-pub-${numeric}`,
    pubId: `pub-${numeric}`,
  }
}