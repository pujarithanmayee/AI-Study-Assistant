// components/CreateNote.js
import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateNote = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    await fetch('http://localhost:8000/notes/', {
      method: 'POST',
      body: formData,
    });

    navigate('/');
  };

  return (
    <div>
      <Typography variant="h6">Create Note</Typography>
      <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 2 }} />
      <TextField fullWidth label="Content" value={content} multiline rows={6} onChange={(e) => setContent(e.target.value)} sx={{ mt: 2 }} />
      <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>Save Note</Button>
    </div>
  );
};

export default CreateNote;