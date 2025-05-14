import { format, parse, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

// se asocia un numero a cada dia abreviado
const dayToNumber = {
  'Dom': 0,
  'Lun': 1,
  'Mar': 2,
  'Mié': 3,
  'Mie': 3,  // se añade variante sin tilde para evitar errores
  'Jue': 4,
  'Vie': 5,
  'Sáb': 6,
  'Sab': 6   // lo mismo que con el miercoles
};

// Función para convertir horarios de cursos en eventos para el calendario
export const convertCoursesToEvents = (courses) => {
  const currentDate = new Date();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // con esto se define que la semana comienza los lunes

  const courseEvents = [];

  courses.forEach(course => {
    // se omiten los ramos sin horarios
    if (!course.scheduleStrings || !course.scheduleStrings.length) return;

    course.scheduleStrings.forEach(schedule => {
      try {
        console.log(`Procesando horario: "${schedule}"`);
        
        // con esto se asegura que tome los dias con todas las puntuaciones de forma correcta
        const dayMatch = schedule.match(/^([A-Za-zÁÉÍÓÚáéíóúÀÈÌÒÙàèìòùÑñ]{3})\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
        
        if (!dayMatch) {
          console.warn(`Formato de horario no reconocido: "${schedule}"`);
          return;
        }
        
        const [_, dayAbbr, startTimeStr, endTimeStr] = dayMatch;
        
        // se normaliza la abreviatura del día, se quitan los tildes
        const normalizedDayAbbr = dayAbbr
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        // se obtienen los numeros correspondientes a los dias de ambas formas, normalizada y orignal
        let dayNum;
        if (normalizedDayAbbr === "Mie") {
          dayNum = 3; 
          console.log(`Día miércoles detectado (normalizado): "${dayAbbr}" -> ${dayNum}`);
        } else if (normalizedDayAbbr === "Sab") {
          dayNum = 6; 
          console.log(`Día sábado detectado (normalizado): "${dayAbbr}" -> ${dayNum}`);
        } else {
          dayNum = dayToNumber[dayAbbr];
          console.log(`Día estándar detectado: "${dayAbbr}" -> ${dayNum}`);
        }
        
        if (dayNum === undefined) {
          console.warn(`Día no reconocido: "${dayAbbr}" en horario: "${schedule}"`);
          return;
        }
        
        // Mapeo de abreviaturas a nombres completos 
        const dayNames = {
          'Dom': 'Domingo',
          'Lun': 'Lunes', 
          'Mar': 'Martes',
          'Mié': 'Miércoles',
          'Mie': 'Miércoles',
          'Jue': 'Jueves',
          'Vie': 'Viernes',
          'Sáb': 'Sábado',
          'Sab': 'Sábado' 
        };
        
        // se crea una fecha para este horario en la semana actual
        const eventDate = addDays(weekStart, dayNum);
        
        // se convierte de string a date
        const startTimeFormat = 'HH:mm';
        const parsedStartTime = parse(startTimeStr, startTimeFormat, new Date());
        const parsedEndTime = parse(endTimeStr, startTimeFormat, new Date());
        
        // se crean las fechas completas para el evento
        const startDate = new Date(eventDate);
        startDate.setHours(parsedStartTime.getHours(), parsedStartTime.getMinutes());
        
        const endDate = new Date(eventDate);
        endDate.setHours(parsedEndTime.getHours(), parsedEndTime.getMinutes());
        
        // Mostrar información de depuración
        console.log(`Creando evento para curso "${course.name}": ${dayNames[dayAbbr] || 'Día desconocido'} ${startTimeStr}-${endTimeStr}`);
        
        // Se crea el evento para este horario
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
          // Propiedades adicionales
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
          
          // con esto se hace que se repita todas las semanas
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
