import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/rubik';
import '@fontsource/secular-one';
import './index.css';
import App from './App';

// מציאת האלמנט שבו נרצה להריץ את האפליקציה
const container = document.getElementById('root');

// יצירת השורש והפעלת האפליקציה
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
