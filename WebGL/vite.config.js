import { defineConfig } from 'vite';
import vitePluginGLSL from 'vite-plugin-glsl'; // Renombra para evitar confusión

export default defineConfig({
  plugins: [
    vitePluginGLSL(), // Llama correctamente al plugin
  ],
});
