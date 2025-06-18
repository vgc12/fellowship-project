import { defineConfig } from 'vite';
import string from 'vite-plugin-string';
import react from '@vitejs/plugin-react';


export default defineConfig({
    plugins: [
        react(),
        string({
            include: '**/*.wgsl', // Specify that .wgsl files should be treated as strings
            compress: false, // Disable compression to keep the original formatting
        }),
    ],
});