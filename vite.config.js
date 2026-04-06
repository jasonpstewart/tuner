import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

const buildTimestamp = new Date().toISOString()

export default defineConfig({
  base: '/tuner/',
  plugins: [
    basicSsl(),
    // Inject build timestamp into sw.js so the browser sees a byte-change
    // on every deploy, triggering SW update within 24 hours.
    // sw.js lives in public/ and is copied as a static asset, so we use
    // writeBundle (runs after copy) to prepend the stamp.
    {
      name: 'stamp-sw',
      apply: 'build',
      async writeBundle(options) {
        const path = await import('node:path')
        const fs = await import('node:fs')
        const swPath = path.default.join(options.dir, 'sw.js')
        const content = fs.default.readFileSync(swPath, 'utf-8')
        fs.default.writeFileSync(swPath, `// build: ${buildTimestamp}\n${content}`)
      },
    },
  ],
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  server: {
    host: true,
    https: true,
  },
})
