import React, { useState, useEffect } from 'react';
import { Button, Typography, TextField, Grid, Card, CardMedia, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AskQuestion = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  // Fetch answer and images related to the question
  const fetchAnswer = async (question) => {
    setLoading(true);
    setError('');
    setAnswer('');
    setImages([]);

    try {
      const formData = new FormData();
      formData.append('query', question);

      const response = await fetch('http://localhost:8000/ask/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Something went wrong with the API.');

      const data = await response.json();
      setAnswer(data.answer || 'No answer found.');
      setImages(data.images || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotes = async () => {
    const formData = new FormData();
    formData.append('title', title || 'Untitled');
    formData.append('content', answer);

    await fetch('http://localhost:8000/notes/', {
      method: 'POST',
      body: formData,
    });

    navigate('/');
  };

  const handleAsk = () => {
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }
    fetchAnswer(question.trim());
  };

  return (
    <div>
      <Typography variant="h6">Ask Your Question</Typography>
      <TextField
        label="Your Question"
        fullWidth
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        sx={{ mt: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleAsk}
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Ask'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {answer && (
        <div>
          <Typography variant="h6" sx={{ mt: 2 }}>Answer:</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>{answer}</Typography>

          {images.length > 0 && (
            <div>
              <Typography variant="subtitle1" sx={{ mt: 3 }}>
                Related Images:
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {images.map((img, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={img}
                        alt={'Related image ${index + 1}'}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}

          {/* Save to Notes Button */}
          <TextField
            label="Note Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSaveToNotes}
            sx={{ mt: 2 }}
          >
            Save to Notes
          </Button>
        </div>
      )}
    </div>
  );
};

export default AskQuestion;