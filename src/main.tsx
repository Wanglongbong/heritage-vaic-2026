import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource-variable/pixelify-sans';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
