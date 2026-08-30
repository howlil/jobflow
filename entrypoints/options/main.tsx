import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../../src/components/ui/tailwind.css';
import App from './App';

const root = document.getElementById('root');

if (root === null) {
  throw new Error('Options root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
