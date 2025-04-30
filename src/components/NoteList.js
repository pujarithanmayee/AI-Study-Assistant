import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Typography, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ChatAssistant from './ChatAssistant';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const result = searchParams.get('ans');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch('http://localhost:8000/notes/');
    const data = await res.json();
    setNotes(data);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNote(null);
    setViewMode(false);
  };

  const handleEditClick = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setViewMode(false);
    setOpen(true);
  };

  const handleViewClick = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setViewMode(true);
    setOpen(true);
  };

  const handleDelete = async (noteId) => {
    await fetch(`http://localhost:8000/notes/${noteId}`, {
      method: 'DELETE',
    });
    fetchNotes();
  };

  const handleSubmit = async () => {
    if (!selectedNote) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    await fetch(`http://localhost:8000/notes/${selectedNote.id}`, {
      method: 'PUT',
      body: formData,
    });

    handleClose();
    fetchNotes();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" gutterBottom>Your Notes</Typography>
        <Button onClick={() => { navigate('/chat'); }} startIcon={<AcUnitIcon />}>Chat Bot</Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sl No</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map((note, index) => (
              <TableRow key={note.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{note.title}</TableCell>
                <TableCell>{note.content}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="info" onClick={() => handleViewClick(note)} style={{ marginRight: 8 }}>
                    View
                  </Button>
                  <Button variant="outlined" color="primary" onClick={() => handleEditClick(note)} style={{ marginRight: 8 }}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleDelete(note.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button onClick={() => { navigate('/create-note'); }}>Add Note</Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{viewMode ? 'View Note' : 'Edit Note'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={viewMode}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={viewMode}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Close</Button>
          {!viewMode && (
            <Button onClick={handleSubmit} color="primary" variant="contained">Submit</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Floating ChatAssistant */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999 }}>
        <ChatAssistant />
      </div>
    </div>
  );
};

export default NoteList;
