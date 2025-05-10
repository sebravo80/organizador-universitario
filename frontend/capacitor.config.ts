import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.diatomeauniversitaria.app',
  appName: 'Organizador Universitario',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_notification",
      iconColor: "#72002A",
      sound: "notification.wav"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#72002A",
      showSpinner: true,
      spinnerColor: "#FFFFFF"
    }
  }
};

export default config;
