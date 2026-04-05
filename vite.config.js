import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  base: '/tuner/',
  plugins: [basicSsl()],
  server: {
    host: true,
    https: true,
  },
})
