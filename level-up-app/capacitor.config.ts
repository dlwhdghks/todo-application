import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dlwhdghks.levelup',
  appName: 'Level Up',
  webDir: 'dist',
  server: {
    url: 'https://todo-application-amber-kappa.vercel.app',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
