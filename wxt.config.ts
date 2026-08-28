import { defineConfig } from 'wxt';

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
    permissions: ['storage'],
  },
});
