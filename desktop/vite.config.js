import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron/simple';

export default defineConfig({
  plugins: [
    vue(),
    electron({
      main: {
        entry: 'electron/main.mjs',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      preload: {
        input: 'electron/preload.mjs',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      renderer: {}
    })
  ],
  server: {
    port: 5173
  }
});
