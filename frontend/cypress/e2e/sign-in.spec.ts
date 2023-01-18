import { email, name, password, alternateEmail, degree, degreeYear } from '../fixtures/user.json';
import signIn from '../support/e2e';

describe('Sign in tests', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
            signIn(email, name, password);
        });

        describe('User', () => {
            it('can sign in with credentials and reach profile page.', () => {
                cy.visit('/profile');
                cy.url().should('contain', 'profile');
            });

            it('can submit profile info.', () => {
                cy.visit('/profile');
                cy.get('[data-cy=profile-alt-email]').clear().type(alternateEmail);
                cy.get('[data-cy="profile-degree"]').select(degree);
                cy.get('[data-cy="profile-degree-year"]').select(degreeYear);

                cy.get('button[type=submit]').click();
                cy.get('button[type=submit]').should('contain', 'Endringer lagret!');
            });

            it('can visit profile page and see persisted profile info.', () => {
                cy.visit('/profile');
                cy.get('[data-cy="profile-alt-email"]').should('have.value', alternateEmail);
                cy.get('[data-cy="profile-degree"]').find('option:selected').should('have.text', degree);
                cy.get('[data-cy="profile-degree-year"]').find('option:selected').should('have.text', degreeYear);
            });
        });
    });
});
