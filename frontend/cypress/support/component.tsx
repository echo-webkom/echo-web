// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import { mount, MountOptions, MountReturn } from 'cypress/react';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
    namespace Cypress {
        interface Chainable {
            mount(
                component: React.ReactNode,
                options?: MountOptions & { session?: SessionProviderProps },
            ): Cypress.Chainable<MountReturn>;
        }
    }
}

Cypress.Commands.add('mount', (component, options = {}) =>
    mount(
        <SessionProvider
            session={{
                expires: new Date(Date.now() + 2 * 86400).toISOString(),
                user: { name: 'admin' },
                idToken: 'idToken',
                accessToken: 'accessToken',
            }}
        >
            {component}
        </SessionProvider>,
        options,
    ),
);

// Example use:
// cy.mount(<MyComponent />)
