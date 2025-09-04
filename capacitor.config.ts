import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.startindev.zishop',
  appName: 'ZiShop',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'http://66.29.155.41:5000',
    cleartext: true
  },
  ios: {
    scheme: 'zishop'
  },
  android: {
    scheme: 'zishop'
  }
};

export default config;
