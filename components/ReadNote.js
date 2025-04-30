// components/ReadNote.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button } from '@mui/material';

const ReadNote = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/notes/${noteId}`)
      .then(res => res.json())
      .then(data => setNote(data));
  }, [noteId]);

  const handleDelete = async () => {
    await fetch(`http://localhost:8000/notes/${noteId}`, { method: 'DELETE' });
    navigate('/notes');
  };

  if (!note) return <Typography>Loading...</Typography>;

  return (
    <div>
      <Typography variant="h5">{note.title}</Typography>
      <Typography sx={{ mt: 2 }}>{note.content}</Typography>
      <Button variant="outlined" onClick={() => navigate(`/notes/${noteId}/edit`)} sx={{ mt: 2 }}>Edit</Button>
      <Button variant="contained" color="error" onClick={handleDelete} sx={{ mt: 2, ml: 2 }}>Delete</Button>
    </div>
  );
};

export default ReadNote;
