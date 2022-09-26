/* eslint-disable @typescript-eslint/no-unsafe-call */

Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('loop limit exceeded')) {
        return false;
    }
});

describe('Nav Menus', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
            cy.visit('/');
        });

        describe('When visiting the home page, navbar should navigate to', () => {
            it('home page', () => {
                cy.get('[data-cy=home]').click();
                cy.url().should('eq', 'http://localhost:3000/');
            });

            // TODO: Add more tests for other nav links
        });
    });
});
