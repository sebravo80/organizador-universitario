import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Storage } from '@capacitor/storage';

// Valores predeterminados para las notificaciones
const DEFAULT_TASK_NOTIFICATION_TIME = 60; // 60 minutos (1 hora) antes
const DEFAULT_EVENT_NOTIFICATION_TIME = 15; // 15 minutos antes

// Guardar preferencias de notificaciones
export const saveNotificationPreferences = async (preferences) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await Storage.set({
      key: 'notificationPreferences',
      value: JSON.stringify(preferences)
    });
    console.log('Preferencias de notificación guardadas:', preferences);
    return true;
  } catch (error) {
    console.error('Error al guardar preferencias de notificación:', error);
    return false;
  }
};

// Obtener preferencias de notificaciones
export const getNotificationPreferences = async () => {
  if (!Capacitor.isNativePlatform()) {
    return {
      taskNotificationTime: DEFAULT_TASK_NOTIFICATION_TIME,
      eventNotificationTime: DEFAULT_EVENT_NOTIFICATION_TIME,
      enabled: false
    };
  }
  
  try {
    const { value } = await Storage.get({ key: 'notificationPreferences' });
    
    if (!value) {
      // Valores predeterminados
      const defaultPrefs = {
        taskNotificationTime: DEFAULT_TASK_NOTIFICATION_TIME,
        eventNotificationTime: DEFAULT_EVENT_NOTIFICATION_TIME,
        enabled: true
      };
      
      await saveNotificationPreferences(defaultPrefs);
      return defaultPrefs;
    }
    
    return JSON.parse(value);
  } catch (error) {
    console.error('Error al obtener preferencias de notificación:', error);
    return {
      taskNotificationTime: DEFAULT_TASK_NOTIFICATION_TIME,
      eventNotificationTime: DEFAULT_EVENT_NOTIFICATION_TIME,
      enabled: false
    };
  }
};

// Verificar si el dispositivo puede usar notificaciones
export const checkNotificationsPermission = async () => {
  if (!Capacitor.isNativePlatform()) return false;
  
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') return true;
    
    const { display: newDisplay } = await LocalNotifications.requestPermissions();
    return newDisplay === 'granted';
  } catch (error) {
    console.error('Error al verificar permisos de notificación:', error);
    return false;
  }
};

// Programar notificación para una tarea
export const scheduleTaskNotification = async (task) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Verificar que task y task._id existen
    if (!task || !task._id) {
      console.warn('Tarea inválida para programar notificación');
      return;
    }
    
    // Obtener preferencias del usuario
    const preferences = await getNotificationPreferences();
    if (!preferences.enabled) {
      console.log('Notificaciones desactivadas por el usuario');
      return;
    }
    
    // Usar el tiempo de anticipación configurado por el usuario
    const minutesBefore = preferences.taskNotificationTime;
    
    const id = Math.abs(task._id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0)) % 100000;
    
    // Verificar que dueDate existe y es válida
    if (!task.dueDate) {
      console.warn('Fecha de vencimiento no válida para notificación');
      return;
    }
    
    const dueDate = new Date(task.dueDate);
    
    // Verificar que la fecha es válida
    if (isNaN(dueDate.getTime())) {
      console.warn('Fecha de vencimiento no válida para notificación:', task.dueDate);
      return;
    }
    
    // Crear fecha para la notificación según la preferencia del usuario
    const notificationTime = new Date(dueDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);
    
    // Verificar que la fecha de notificación no ha pasado ya
    const now = new Date();
    if (notificationTime <= now) {
      console.log('La fecha de notificación ya ha pasado:', notificationTime);
      return;
    }
    
    // Formatear el tiempo de anticipación para mostrar en la notificación
    let anticipationText = "";
    if (minutesBefore >= 60) {
      const hours = Math.floor(minutesBefore / 60);
      anticipationText = `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      anticipationText = `${minutesBefore} minutos`;
    }
    
    // Programar notificación
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: `¡${task.title} está por vencer!`,
        body: `Tu tarea vence en ${anticipationText}, el ${dueDate.toLocaleString()}`,
        schedule: { at: notificationTime },
        smallIcon: 'ic_notification'
      }]
    });
    
    console.log('Notificación programada para:', task.title, 'a las', notificationTime.toLocaleString());
  } catch (error) {
    console.error('Error al programar notificación:', error);
  }
};

// Programar notificación para un evento
export const scheduleEventNotification = async (event) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Verificaciones
    if (!event || !event._id || !event.startDate) {
      console.warn('Evento inválido para programar notificación');
      return;
    }
    
    // Obtener preferencias del usuario
    const preferences = await getNotificationPreferences();
    if (!preferences.enabled) {
      console.log('Notificaciones desactivadas por el usuario');
      return;
    }
    
    // Usar el tiempo de anticipación configurado por el usuario
    const minutesBefore = preferences.eventNotificationTime;
    
    const id = Math.abs(event._id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0)) % 100000;
    
    const startDate = new Date(event.startDate);
    
    if (isNaN(startDate.getTime())) {
      console.warn('Fecha de inicio no válida para notificación:', event.startDate);
      return;
    }
    
    const notificationTime = new Date(startDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);
    
    const now = new Date();
    if (notificationTime <= now) {
      console.log('La fecha de notificación ya ha pasado:', notificationTime);
      return;
    }
    
    // Formatear el tiempo de anticipación para mostrar en la notificación
    let anticipationText = "";
    if (minutesBefore >= 60) {
      const hours = Math.floor(minutesBefore / 60);
      anticipationText = `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      anticipationText = `${minutesBefore} minutos`;
    }
    
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: `¡${event.title} comenzará pronto!`,
        body: `Tu evento comienza en ${anticipationText}, a las ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
        schedule: { at: notificationTime },
        smallIcon: 'ic_notification'
      }]
    });
    
    console.log('Notificación programada para evento:', event.title);
  } catch (error) {
    console.error('Error al programar notificación de evento:', error);
  }
};

// Programar notificaciones para todas las tareas pendientes
export const scheduleAllTaskNotifications = async (tasks) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Filtrar solo tareas no completadas
    const pendingTasks = tasks.filter(task => task.status !== 'Completada');
    
    // Programar notificación para cada tarea
    for (const task of pendingTasks) {
      await scheduleTaskNotification(task);
    }
    
    console.log(`Programadas notificaciones para ${pendingTasks.length} tareas`);
  } catch (error) {
    console.error('Error al programar notificaciones de tareas:', error);
  }
};

// Programar notificaciones para todos los eventos futuros
export const scheduleAllEventNotifications = async (events) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    const now = new Date();
    // Filtrar solo eventos futuros
    const futureEvents = events.filter(event => new Date(event.startDate) > now);
    
    // Programar notificación para cada evento
    for (const event of futureEvents) {
      await scheduleEventNotification(event);
    }
    
    console.log(`Programadas notificaciones para ${futureEvents.length} eventos`);
  } catch (error) {
    console.error('Error al programar notificaciones de eventos:', error);
  }
};

// Inicializar sistema de notificaciones
export const initializeNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    await checkNotificationsPermission();
    
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notificación recibida:', notification);
    });
    
    console.log('Sistema de notificaciones inicializado');
  } catch (error) {
    console.error('Error al inicializar notificaciones:', error);
  }
};

// Registrar canales de notificaciones (Android 8.0+)
export const registerNotificationChannels = async () => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  
  await LocalNotifications.createChannel({
    id: 'tasks-channel',
    name: 'Tareas',
    description: 'Notificaciones sobre tareas pendientes y vencimientos',
    importance: 5,
    visibility: 1,
    sound: 'notification.wav',
    vibration: true,
    lights: true,
    lightColor: '#E91E63'
  });
  
  await LocalNotifications.createChannel({
    id: 'events-channel',
    name: 'Eventos',
    description: 'Notificaciones sobre eventos próximos',
    importance: 4,
    visibility: 1,
    sound: 'notification.wav',
    vibration: true
  });
};