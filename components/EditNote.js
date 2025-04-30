// components/EditNote.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography } from '@mui/material';

const EditNote = () => {
  const { noteId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/notes/${noteId}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
      });
  }, [noteId]);

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    await fetch(`http://localhost:8000/notes/${noteId}`, {
      method: 'PUT',
      body: formData,
    });

    navigate(`/notes/${noteId}`);
  };

  return (
    <div>
      <Typography variant="h6">Edit Note</Typography>
      <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 2 }} />
      <TextField fullWidth label="Content" multiline rows={6} value={content} onChange={(e) => setContent(e.target.value)} sx={{ mt: 2 }} />
      <Button variant="contained" onClick={handleUpdate} sx={{ mt: 2 }}>Update</Button>
    </div>
  );
};

export default EditNote;