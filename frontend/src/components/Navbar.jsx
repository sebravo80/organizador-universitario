import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Organizador Universitario
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">Dashboard</Button>
          <Button color="inherit" component={Link} to="/weekly">Horario</Button>
          <Button color="inherit" component={Link} to="/courses">Ramos</Button>
          <Button color="inherit" component={Link} to="/tasks">Tareas</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;