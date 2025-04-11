import { useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function Courses() {
  const [courses, setCourses] = useState([
    { id: 1, name: 'Matemáticas', code: 'MAT101', professor: 'Dr. García', schedule: 'Lun/Mie 10:00-12:00', room: 'A-101' },
    { id: 2, name: 'Física', code: 'FIS201', professor: 'Dra. Rodríguez', schedule: 'Mar/Jue 14:00-16:00', room: 'B-203' },
    { id: 3, name: 'Programación', code: 'PRG301', professor: 'Ing. López', schedule: 'Mie/Vie 08:00-10:00', room: 'LAB-01' }
  ]);

  const [open, setOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    professor: '',
    schedule: '',
    room: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setCourses([...courses, { ...newCourse, id: courses.length + 1 }]);
    setNewCourse({ name: '', code: '', professor: '', schedule: '', room: '' });
    handleClose();
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Mis Ramos
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Añadir Ramo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Profesor</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Sala</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.code}</TableCell>
                <TableCell>{course.professor}</TableCell>
                <TableCell>{course.schedule}</TableCell>
                <TableCell>{course.room}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para añadir nuevo ramo */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Añadir Nuevo Ramo</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Nombre del Ramo"
            fullWidth
            variant="outlined"
            value={newCourse.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="code"
            label="Código"
            fullWidth
            variant="outlined"
            value={newCourse.code}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="professor"
            label="Profesor"
            fullWidth
            variant="outlined"
            value={newCourse.professor}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="schedule"
            label="Horario"
            fullWidth
            variant="outlined"
            value={newCourse.schedule}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="room"
            label="Sala"
            fullWidth
            variant="outlined"
            value={newCourse.room}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Courses;