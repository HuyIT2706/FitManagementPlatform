import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vn.nutricore.app',
  appName: 'NutriCore',
  webDir: 'public',
  server: {
    // Point directly to live web app so updates on Vercel take effect instantly on mobile!
    url: 'https://nutricore-olive.vercel.app',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    // Eliminates the "; wv" marker and adds app identifier
    overrideUserAgent:
      'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 NutriCoreApp/1.0',
  },
};

export default config;
