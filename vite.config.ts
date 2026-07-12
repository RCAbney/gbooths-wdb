import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        env: {
            // createClient() throws if these are undefined -- tests that care about
            // supabase behavior mock '../lib/supabase' outright, but every test that
            // transitively imports it (even without calling it) needs the module to
            // construct without throwing.
            VITE_SUPABASE_URL: 'https://example.supabase.co',
            VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        },
    },
});
