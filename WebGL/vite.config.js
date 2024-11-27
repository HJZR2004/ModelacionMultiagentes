import { defineConfig } from 'vite';
import vitePluginGLSL from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    vitePluginGLSL(),
  ],
});
