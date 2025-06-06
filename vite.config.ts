import { defineConfig } from 'vite';
import string from 'vite-plugin-string';

export default defineConfig({
    plugins: [
        string({
            include: '**/*.wgsl', // Specify that .wgsl files should be treated as strings
            compress: false, // Disable compression to keep the original formatting
        }),
    ],
});