import { format, parse, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

// Mapeo de días abreviados a números (0 = domingo, 1 = lunes, etc.)
const dayToNumber = {
  'Dom': 0,
  'Lun': 1,
  'Mar': 2,
  'Mié': 3,
  'Mie': 3,  // Añadir esta variante sin acento
  'Jue': 4,
  'Vie': 5,
  'Sáb': 6,
  'Sab': 6   // También añadir esta variante sin acento
};

// Función para convertir horarios de cursos en eventos para el calendario
export const convertCoursesToEvents = (courses) => {
  const currentDate = new Date();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Semana comienza en lunes

  const courseEvents = [];

  courses.forEach(course => {
    // Omitir cursos sin horarios
    if (!course.scheduleStrings || !course.scheduleStrings.length) return;

    course.scheduleStrings.forEach(schedule => {
      try {
        console.log(`Procesando horario: "${schedule}"`);
        
        // Extracción más flexible del día y el horario
        const dayMatch = schedule.match(/^(\w{3})\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
        
        if (!dayMatch) {
          console.warn(`Formato de horario no reconocido: "${schedule}"`);
          return;
        }
        
        const [_, dayAbbr, startTimeStr, endTimeStr] = dayMatch;
        
        // Normalizar la abreviatura del día (eliminar acentos)
        const normalizedDayAbbr = dayAbbr
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        // Obtener número de día desde la versión normalizada o la original
        let dayNum;
        if (normalizedDayAbbr === "Mie") {
          dayNum = 3;  // Miércoles
          console.log(`Día miércoles detectado (normalizado): "${dayAbbr}" -> ${dayNum}`);
        } else if (normalizedDayAbbr === "Sab") {
          dayNum = 6;  // Sábado
          console.log(`Día sábado detectado (normalizado): "${dayAbbr}" -> ${dayNum}`);
        } else {
          dayNum = dayToNumber[dayAbbr];
          console.log(`Día estándar detectado: "${dayAbbr}" -> ${dayNum}`);
        }
        
        if (dayNum === undefined) {
          console.warn(`Día no reconocido: "${dayAbbr}" en horario: "${schedule}"`);
          return;
        }
        
        // Mapeo de abreviaturas a nombres completos de días
        const dayNames = {
          'Dom': 'Domingo',
          'Lun': 'Lunes', 
          'Mar': 'Martes',
          'Mié': 'Miércoles',
          'Mie': 'Miércoles', // Añadida esta variante
          'Jue': 'Jueves',
          'Vie': 'Viernes',
          'Sáb': 'Sábado',
          'Sab': 'Sábado' // Añadida esta variante
        };
        
        // Crear fechas para este horario en la semana actual
        const eventDate = addDays(weekStart, dayNum);
        
        // Convertir strings de hora a objetos Date
        const startTimeFormat = 'HH:mm';
        const parsedStartTime = parse(startTimeStr, startTimeFormat, new Date());
        const parsedEndTime = parse(endTimeStr, startTimeFormat, new Date());
        
        // Crear fechas completas para el evento
        const startDate = new Date(eventDate);
        startDate.setHours(parsedStartTime.getHours(), parsedStartTime.getMinutes());
        
        const endDate = new Date(eventDate);
        endDate.setHours(parsedEndTime.getHours(), parsedEndTime.getMinutes());
        
        // Mostrar información de depuración
        console.log(`Creando evento para curso "${course.name}": ${dayNames[dayAbbr] || 'Día desconocido'} ${startTimeStr}-${endTimeStr}`);
        
        // Crear el evento para este horario
        courseEvents.push({
          id: `course-${course._id}-${dayAbbr}-${startTimeStr}`,
          title: course.name,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          backgroundColor: course.color || '#3498db',
          borderColor: course.color || '#3498db',
          textColor: '#fff',
          daysOfWeek: [dayNum],
          startTime: startTimeStr,
          endTime: endTimeStr,
          // Propiedades adicionales útiles
          extendedProps: {
            courseId: course._id,
            type: 'course-schedule',
            location: course.room || '',
            professor: course.professor || '',
            courseCode: course.courseCode || '',
            dayName: dayNames[dayAbbr] || dayNames[normalizedDayAbbr] || dayAbbr,
            startTime: startTimeStr,
            endTime: endTimeStr,
            description: `${course.courseCode || ''} ${course.professor ? '- Prof: ' + course.professor : ''}`
          },
          // Esta propiedad hace que se repita semanalmente
          rrule: {
            freq: 'weekly',
            interval: 1,
            byweekday: [dayNum]
          }
        });
      } catch (error) {
        console.error(`Error al procesar horario "${schedule}" del curso ${course.name}:`, error);
      }
    });
  });

  console.log(`Se generaron ${courseEvents.length} eventos de cursos para el calendario`);
  return courseEvents;
};