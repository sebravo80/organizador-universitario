import { useState } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, 
  Checkbox, IconButton, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, 
  FormControl, InputLabel, Select
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function Tasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Informe de Laboratorio', course: 'Física', dueDate: '2023-11-15', completed: false, priority: 'alta' },
    { id: 2, title: 'Ejercicios Cap. 5', course: 'Matemáticas', dueDate: '2023-11-20', completed: true, priority: 'media' },
    { id: 3, title: 'Proyecto Final', course: 'Programación', dueDate: '2023-12-10', completed: false, priority: 'alta' }
  ]);

  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    course: '',
    dueDate: '',
    completed: false,
    priority: 'media'
  });

  const courses = ['Matemáticas', 'Física', 'Programación', 'Historia', 'Inglés'];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setTasks([...tasks, { ...newTask, id: tasks.length + 1 }]);
    setNewTask({ title: '', course: '', dueDate: '', completed: false, priority: 'media' });
    handleClose();
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tareas y Evaluaciones
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Añadir Tarea
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => deleteTask(task.id)}>
                  <DeleteIcon />
                </IconButton>
              }
              sx={{
                bgcolor: task.completed ? 'rgba(0, 200, 0, 0.1)' : 
                         task.priority === 'alta' ? 'rgba(255, 0, 0, 0.1)' : 
                         'inherit'
              }}
            >
              <Checkbox
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
              />
              <ListItemText
                primary={task.title}
                secondary={`${task.course} | Fecha: ${task.dueDate} | Prioridad: ${task.priority}`}
                sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Diálogo para añadir nueva tarea */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Añadir Nueva Tarea</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Título de la Tarea"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Ramo</InputLabel>
            <Select
              name="course"
              value={newTask.course}
              label="Ramo"
              onChange={handleChange}
            >
              {courses.map((course) => (
                <MenuItem key={course} value={course}>{course}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="dueDate"
            label="Fecha de Entrega"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Prioridad</InputLabel>
            <Select
              name="priority"
              value={newTask.priority}
              label="Prioridad"
              onChange={handleChange}
            >
              <MenuItem value="baja">Baja</MenuItem>
              <MenuItem value="media">Media</MenuItem>
              <MenuItem value="alta">Alta</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tasks;