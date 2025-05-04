import { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, List, ListItem, Checkbox, IconButton, ListItemText 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    getPersonalNotes, createPersonalNote, updatePersonalNote, deletePersonalNote
  } from '../services/personalNotes';

export default function PersonalNotes() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    getPersonalNotes().then(setNotes);
  }, []);

  const handleAdd = async () => {
    if (!text.trim()) return;
    const newNote = await createPersonalNote(text);
    setNotes([newNote, ...notes]);
    setText('');
  };

  const handleToggle = async (note) => {
    const updated = await updatePersonalNote(note._id, { done: !note.done, text: note.text });
    setNotes(notes.map(n => n._id === note._id ? updated : n));
  };

  const handleDelete = async (id) => {
    await deletePersonalNote(id);
    setNotes(notes.filter(n => n._id !== id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          label="Nueva nota personal"
          value={text}
          onChange={e => setText(e.target.value)}
          fullWidth
        />
        <Button onClick={handleAdd} variant="contained" sx={{ ml: 2 }}>Agregar</Button>
      </Box>
      <List>
        {notes.map(note => (
          <ListItem
            key={note._id}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDelete(note._id)}>
                <DeleteIcon />
              </IconButton>
            }
            disablePadding
          >
            <Checkbox
              checked={note.done}
              onChange={() => handleToggle(note)}
            />
            <ListItemText
              primary={note.text}
              sx={{ textDecoration: note.done ? 'line-through' : 'none' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}