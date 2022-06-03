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
            it('om-echo page', () => {
                cy.get('[data-cy=om-oss]').click();
                cy.url().should('include', '/om-echo/om-oss');
            });

            it('home page', () => {
                cy.get('[data-cy=hjem]').click();
                cy.url().should('eq', 'http://localhost:3000/');
            });
        });
    });
});
