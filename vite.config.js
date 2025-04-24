import glslify from 'rollup-plugin-glslify';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [glslify()],
});
