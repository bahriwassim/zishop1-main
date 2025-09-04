import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.startindev.zishop',
  appName: 'ZiShop',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  ios: {
    scheme: 'zishop',
    minVersion: '13.0'
  },
  android: {
    scheme: 'zishop',
    minSdkVersion: 22
  }
};

export default config;
