import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import api from './api';

export const checkForUpdates = async () => {
  if (!Capacitor.isNativePlatform()) return null;
  
  try {
    const info = await Device.getInfo();
    const currentVersion = info.appVersion;
    
    // Llamada a tu API para verificar la versión más reciente
    const response = await api.get('/version');
    const latestVersion = response.data.version;
    
    if (currentVersion !== latestVersion) {
      return {
        hasUpdate: true,
        currentVersion,
        latestVersion
      };
    }
    
    return { hasUpdate: false };
  } catch (error) {
    console.error('Error al verificar actualizaciones:', error);
    return { hasUpdate: false, error };
  }
};