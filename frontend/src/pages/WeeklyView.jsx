import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function WeeklyView() {
  const [events, setEvents] = useState([
    // Ejemplos de eventos
    { title: 'Matemáticas', start: '2023-11-13T10:00:00', end: '2023-11-13T12:00:00', backgroundColor: '#4285F4' },
    { title: 'Física', start: '2023-11-14T14:00:00', end: '2023-11-14T16:00:00', backgroundColor: '#EA4335' },
    { title: 'Programación', start: '2023-11-15T08:00:00', end: '2023-11-15T10:00:00', backgroundColor: '#FBBC05' }
  ]);

  const handleDateClick = (arg) => {
    // Función para manejar clics en fechas (para añadir eventos)
    console.log(arg.dateStr);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vista Semanal
      </Typography>
      <Paper sx={{ p: 2 }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          height="70vh"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
        />
      </Paper>
    </Box>
  );
}

export default WeeklyView;