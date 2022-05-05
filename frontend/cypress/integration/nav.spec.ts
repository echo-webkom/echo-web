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
        });

        describe('When visiting the home page', () => {
            it('Should visit homepage', () => {
                cy.visit('/');
            });

            describe('navbar', () => {
                it('Should navigate to om-echo page', () => {
                    cy.get('[data-cy=nav-item]').contains('Om echo').click();
                    cy.url().should('include', '/om-echo/om-oss');
                });
                it('Should navigate to home page', () => {
                    cy.get('[data-cy=nav-item]').contains('Hjem').click();
                    cy.url().should('eq', 'http://localhost:3000/');
                });
            });
        });
    });
});
