import { defineConfig } from 'cypress';

export default defineConfig({
    defaultCommandTimeout: 5000,

    e2e: {
        baseUrl: 'http://localhost:3000',
        specPattern: [
            '**/entry-box.spec.ts',
            '**/nav.spec.ts',
            '**/sign-in.spec.ts',
            '**/happening-registration.spec.ts',
        ],
        watchForFileChanges: false,
    },

    retries: {
        runMode: 5,
    },

    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
});
