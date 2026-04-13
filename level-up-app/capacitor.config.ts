import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.levelup.app',
  appName: 'Level Up',
  webDir: 'dist',
  server: {
    // 배포된 Vercel URL을 사용 (API 호출 + 실시간 업데이트)
    url: 'https://todo-application-amber-kappa.vercel.app',
    cleartext: true,
  },
};

export default config;
