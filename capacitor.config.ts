import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.marill.bingommi3',
  appName: 'mmi3-bingo',
  webDir: 'dist/mmi3-bingo/browser',
  android: {
    minWebViewVersion: 60, // Version minimum de Chrome WebView
  }
};

export default config;
