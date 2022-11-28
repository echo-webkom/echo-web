import { feide } from '../fixtures/feide.json';
import signIn from '../support/e2e';

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    return false;
});

describe('Feide sign in tests', () => {
    describe('720p res', () => {
        for (const { username, password, email, name, alternateEmail, degree, degreeYear } of feide) {
            beforeEach(() => {
                cy.viewport(1280, 720);
            });

            describe('User', () => {
                it('can sign in with Feide and reach profile page.', () => {
                    signIn(username, password, email, name);

                    cy.visit('/profile');
                    cy.url().should('contain', 'profile');
                });

                it('can submit profile info.', () => {
                    signIn(username, password, email, name);

                    cy.visit('/profile');
                    cy.get('[data-cy="profile-alt-email"]').clear().type(alternateEmail);
                    cy.get('[data-cy="profile-degree"]').select(degree);
                    cy.get('[data-cy="profile-degree-year"]').select(degreeYear);

                    cy.get('button[type=submit]').click();
                    cy.get('button[type=submit]').should('contain', 'Endringer lagret!');
                });

                it('can visit profile page and see persisted profile info.', () => {
                    signIn(username, password, email, name);

                    cy.visit('/profile');
                    cy.get('[data-cy="profile-alt-email"]').should('have.value', alternateEmail);
                    cy.get('[data-cy="profile-degree"]').find('option:selected').should('have.text', degree);
                    cy.get('[data-cy="profile-degree-year"]').find('option:selected').should('have.text', degreeYear);
                });
            });
        }
    });
});
