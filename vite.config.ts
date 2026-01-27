import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages 배포 시 base 경로 설정
  // - 로컬 개발 (npm run dev): '/'
  // - 프로덕션 빌드 (npm run build): '/kmedic/'
  base: mode === 'production' ? '/kmedic/' : '/',
}))
