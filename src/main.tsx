import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { TextContentProvider } from './context/TextContentContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TextContentProvider>
      <App />
    </TextContentProvider>
  </StrictMode>,
);

