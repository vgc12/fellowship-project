import {defineConfig} from 'vite';
import string from 'vite-plugin-string';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import path from "path";


export default defineConfig(({command}) =>
{
    const base = '/'

    return {
        plugins: [
            tailwindcss(),
            react(),
            string({
                include: '**/*.wgsl',
                compress: false,
            }),
        ],
        base: base,
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        },

        build: {
            target: 'esnext',
            minify: false,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, './index.html'),
                    'scene-object-list': path.resolve(__dirname, './src/components/scene-object-list.tsx'),
                    'camera-controller': path.resolve(__dirname, './src/components/camera-controller.tsx'),
                    renderer: path.resolve(__dirname, './src/core/renderer/renderer.ts')
                },
                output: {
                    entryFileNames: '[name].js',
                }
            }

        },


        optimizeDeps: {
            include: ['react', 'react-dom', 'react-icons', 'react-icons/*'],
        }
    }
});