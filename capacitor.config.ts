import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.diatomea.organizadoruniversitario',
  appName: 'Organizador Universitario',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      "organizador-universitario-api-49b169773d7f.herokuapp.com",
      "diatomeauniversitaria.studio",
      "diatomeauniversitaria.netlify.app"
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#72002a",
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined
    },
    backgroundColor: "#72002a",
    allowMixedContent: true
  }
};

export default config;