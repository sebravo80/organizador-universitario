import { Typography, Grid, Paper, Box } from '@mui/material';

function Dashboard() {
  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Próximas Tareas</Typography>
            {/* Contenido de tareas próximas */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Horario de Hoy</Typography>
            {/* Contenido del horario */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;