// components/ClearSessionButton.js
import React from 'react';
import { Button } from '@mui/material';

const ClearSessionButton = () => {
  const handleClear = async () => {
    await fetch('http://localhost:8000/clear_memory/');
    window.location.reload();
  };

  return (
    <Button onClick={handleClear} color="inherit">
      Clear Session
    </Button>
  );
};

export default ClearSessionButton;
