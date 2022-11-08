import { defineConfig } from 'cypress';

export default defineConfig({
    defaultCommandTimeout: 5000,

    e2e: {
        baseUrl: 'http://localhost:3000',
        supportFile: false,
        specPattern: [
            '**/entry-box.spec.ts',
            '**/nav.spec.ts',
            '**/happening-registration.spec.ts',
            '**/user-signed-in.spec.ts',
        ],
        experimentalSessionAndOrigin: true,
        watchForFileChanges: false,
    },

    retries: {
        runMode: 2,
    },

    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
});
