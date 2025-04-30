import React, { useState } from 'react';
import {
  Button,
  LinearProgress,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const UploadPDF = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload_pdf/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setMessage(data.message || 'Upload successful!');
      setError(false);
    } catch (err) {
      setMessage(err.message || 'Failed to upload PDF');
      setError(true);
    } finally {
      setUploading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Notes
      </Button>

      <div>
        <Typography variant="h6">Upload a PDF</Typography>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <Button onClick={handleUpload} variant="contained" sx={{ mt: 2 }}>
          Upload
        </Button>

        {uploading && <LinearProgress sx={{ mt: 2 }} />}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={error ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default UploadPDF;
