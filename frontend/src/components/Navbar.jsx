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
          {/* Más botones se añadirán después */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;