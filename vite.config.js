import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const devServerHost = env.VITE_DEV_SERVER_HOST;

    return {
        resolve: {
            alias: {
                'ziggy-js': path.resolve(__dirname, 'vendor/tightenco/ziggy/dist/index.js'),
            },
        },
        server: {
            host: devServerHost ? '0.0.0.0' : '127.0.0.1',
            cors: true,
            ...(devServerHost ? { hmr: { host: devServerHost } } : {}),
        },
        plugins: [
            laravel({
                input: 'resources/js/app.tsx',
                refresh: true,
            }),
            react(),
        ],
    };
});