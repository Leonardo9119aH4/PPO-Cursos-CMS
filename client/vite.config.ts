import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // URL do seu servidor backend
        changeOrigin: true, // Alterar a origem da requisição para o servidor de destino
        secure: false, // Desativar a verificação de SSL (útil para ambientes de desenvolvimento)
        rewrite: (path) => path.replace(/^\/api/, '') // opcional: reescreve o caminho
      },
    },
  },
})
