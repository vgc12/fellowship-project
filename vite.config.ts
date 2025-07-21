import {defineConfig} from 'vite';
import string from 'vite-plugin-string';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import path from "path";


export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        string({
            include: '**/*.wgsl', // Specify that .wgsl files should be treated as strings
            compress: false, // Disable compression to keep the original formatting
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }

});