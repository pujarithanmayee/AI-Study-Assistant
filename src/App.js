import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import UploadPDF from './components/UploadPDF';
import AskQuestion from './components/AskQuestion.js';
import CreateNote from './components/CreateNote.js';
import NoteList from './components/NoteList.js';
import ReadNote from './components/ReadNote';
import EditNote from './components/EditNote';
import ClearSessionButton from './components/ClearSessionButton';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4a148c',
    },
    secondary: {
      main: '#ff6f00',
    },
    background: {
      default: '#f3e5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              PDF Chatbot Assistant
            </Typography>
            <ClearSessionButton />
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ p: 3, backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 3 }}>
            <Routes>
              <Route path="/chat" element={<UploadPDF />} />
              <Route path="/ask" element={<AskQuestion />} />
              <Route path="/create-note" element={<CreateNote />} />
              <Route path="/" element={<NoteList />} />
              <Route path="/notes/:noteId" element={<ReadNote />} />
              <Route path="/notes/:noteId/edit" element={<EditNote />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
