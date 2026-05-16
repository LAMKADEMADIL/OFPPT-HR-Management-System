import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// React 19 — createRoot API (inchangé, mais StrictMode active le compilateur)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
