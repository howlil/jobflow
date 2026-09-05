import { defineConfig } from 'wxt';

import { AUTO_APPLICATION_MATCHES } from './src/domain/forms/auto-application-matches';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    build: {
      modulePreload: false,
    },
  }),
  manifest: {
    name: 'Job Flow',
    description: 'Local-first career form autofill',
    permissions: ['activeTab', 'scripting', 'storage'],
    action: {
      default_title: 'Open Job Flow on this page',
    },
  },
  hooks: {
    'build:manifestGenerated': (_wxt, manifest) => {
      for (const script of manifest.content_scripts ?? []) {
        if (script.js?.includes('content-scripts/content.js')) {
          script.matches = [...AUTO_APPLICATION_MATCHES];
        }
      }
    },
  },
});
