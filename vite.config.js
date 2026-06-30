import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            'ziggy-js': path.resolve(__dirname, 'vendor/tightenco/ziggy/dist/index.js'),
        },
    },
    server: {
        host: '0.0.0.0',
        hmr: {
            host: '172.16.81.207'
        },
        cors: true,
    },
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
});

