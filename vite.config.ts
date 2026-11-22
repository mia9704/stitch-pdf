import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { parseAdsensePublisherId } from './adsenseIds'

function adsenseStaticAssets(rawClientId: string | undefined): Plugin {
  return {
    name: 'adsense-static-assets',
    transformIndexHtml(html) {
      if (!rawClientId) return html
      const { clientId, pubId: _pubId } = parseAdsensePublisherId(rawClientId)

      const scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`
      const snippets = [
        `<meta name="google-adsense-account" content="${clientId}" />`,
        `<script async src="${scriptSrc}" crossorigin="anonymous"></script>`,
      ].join('\n    ')

      return html.replace('</head>', `    ${snippets}\n  </head>`)
    },
    closeBundle() {
      if (!rawClientId) return
      const { pubId } = parseAdsensePublisherId(rawClientId)
      const line = `google.com, ${pubId}, DIRECT, f08e47fec0942fa0\n`
      writeFileSync(resolve('dist', 'ads.txt'), line, 'utf8')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const clientId = env.VITE_ADSENSE_CLIENT_ID?.trim() || undefined

  return {
    plugins: [react(), adsenseStaticAssets(clientId)],
  }
})