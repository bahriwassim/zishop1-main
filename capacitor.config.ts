import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ckizzy1.restexpress',
  appName: 'ZiShop',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  ios: {
    scheme: 'zishop'
  },
  android: {
    scheme: 'zishop'
  }
};

export default config;
