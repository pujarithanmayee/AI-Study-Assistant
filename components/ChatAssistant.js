// src/components/ChatAssistant.js
import React, { useState } from 'react';
import { Box, IconButton, Drawer, Typography, Divider } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import UploadPDF from './UploadPDF';
import AskQuestion from './AskQuestion';

const ChatAssistant = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#1976d2',
          color: '#fff',
          '&:hover': { backgroundColor: '#115293' },
          zIndex: 2000,
        }}
      >
        <ChatIcon />
      </IconButton>

      {/* Drawer for Assistant */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer}>
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6">Chat Assistant</Typography>
          <Divider sx={{ my: 2 }} />
          <UploadPDF />
          <AskQuestion />
        </Box>
      </Drawer>
    </>
  );
};

export default ChatAssistant;
