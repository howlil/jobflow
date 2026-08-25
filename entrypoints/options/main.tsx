import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../../src/ui/design-system/tokens.css';
import '../../src/ui/design-system/primitives.css';
import App from './App';
import '../../src/ui/profile/profile-compact.css';
import '../../src/ui/design-system/mypaas-workspace.css';

const root = document.getElementById('root');

if (root === null) {
  throw new Error('Options root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
