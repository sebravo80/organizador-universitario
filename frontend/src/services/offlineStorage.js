import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// Guardar datos
export const saveOfflineData = async (key, data) => {
  try {
    await Preferences.set({
      key,
      value: JSON.stringify(data)
    });
  } catch (error) {
    console.error(`Error al guardar datos offline (${key}):`, error);
  }
};

// Obtener datos
export const getOfflineData = async (key) => {
  try {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error al obtener datos offline (${key}):`, error);
    return null;
  }
};