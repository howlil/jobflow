import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../../src/ui/design-system/tailwind.css';
import App from './App';

const root = document.getElementById('root');

if (root === null) {
  throw new Error('Popup root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
