import { defineConfig } from 'cypress';

export default defineConfig({
    defaultCommandTimeout: 5000,

    e2e: {
        baseUrl: 'http://localhost:3000',
        specPattern: [
            '**/entry-box.spec.ts',
            '**/nav.spec.ts',
            // Can't get Feide to work in Cypress
            // '**/feide-sign-in.spec.ts',
            // '**/happening-registration.spec.ts',
        ],
        experimentalSessionAndOrigin: true,
        experimentalModifyObstructiveThirdPartyCode: false,
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
