import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'https://workdevapi-byte-the-reserve-backend-od0nf770o.vercel.app',
                changeOrigin: true,
            },
        },
    },
})
