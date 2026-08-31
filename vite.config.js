import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import os from 'node:os';
import path from 'path';

function getLanIp() {
    const excludedNames = /virtualbox|vmware|docker|wsl|vethernet|loopback|bluetooth/i;
    const excludedRanges = /^(192\.168\.(56|99|137)\.|10\.0\.2\.|169\.254\.|172\.(1[7-9])\.)/;

    for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
        if (excludedNames.test(name)) {
            continue;
        }

        for (const addr of addrs ?? []) {
            if (
                (addr.family === 'IPv4' || addr.family === 4)
                && !addr.internal
                && !excludedRanges.test(addr.address)
            ) {
                return addr.address;
            }
        }
    }

    return null;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const lanIp = env.VITE_DEV_SERVER_HOST || getLanIp();

    return {
        resolve: {
            alias: {
                'ziggy-js': path.resolve(__dirname, 'vendor/tightenco/ziggy/dist/index.js'),
            },
        },
        server: {
            host: lanIp ? '0.0.0.0' : '127.0.0.1',
            cors: true,
            ...(lanIp ? { hmr: { host: lanIp } } : {}),
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