/* eslint-disable @typescript-eslint/no-unsafe-call */
import feide from '../fixtures/feide.json';
import { happenings } from '../fixtures/happening.json';
import { waitListEmails } from '../fixtures/users.json';

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    return false;
});

describe('User tests', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
            signIn();
        });

        describe('User', () => {
            it('can sign in with Feide and reach profile page.', () => {
                cy.visit('/profile');
                cy.url().should('contain', 'profile');
            });

            it('can submit profile info.', () => {
                cy.visit('/profile');
                cy.get('[data-cy="profile-alt-email"]').clear().type(feide.alternateEmail);
                cy.get('[data-cy="profile-degree"]').select(feide.degree);
                cy.get('[data-cy="profile-degree-year"]').select(feide.degreeYear);

                cy.get('button[type=submit]').click();
                cy.get('button[type=submit]').should('contain', 'Endringer lagret!');
            });

            it('can visit profile page and see persisted profile info.', () => {
                cy.visit('/profile');
                cy.get('[data-cy="profile-alt-email"]').should('have.value', feide.alternateEmail);
                cy.get('[data-cy="profile-degree"]').find('option:selected').should('have.text', feide.degree);
                cy.get('[data-cy="profile-degree-year"]').find('option:selected').should('have.text', feide.degreeYear);
            });
        });

        describe('Authorized user', () => {
            for (const { slug } of happenings) {
                for (let rows = 5; rows > 0; rows--) {
                    describe('can delete a registration', () => {
                        it('and make a wait list registration move up.', () => {
                            cy.visit(`/event/${slug}`);

                            const { e } = waitListEmails[5 - rows];

                            cy.get(`[data-cy="reg-row-${e.toLowerCase()}"`)
                                .find('[data-cy=reg-row-waitlist-true]')
                                .should('exist');

                            cy.get('[data-cy=delete-button]').first().should('be.visible');
                            cy.get('[data-cy=delete-button]').first().click();

                            cy.get('[data-cy=confirm-delete-button]').click();

                            cy.reload();

                            cy.get(`[data-cy="reg-row-${e.toLowerCase()}"]`)
                                .find('[data-cy=reg-row-waitlist-false]')
                                .should('exist');
                        });
                    });
                }

                for (let rows = 20; rows > 0; rows--) {
                    describe('can delete a registration', () => {
                        it('where the wait list is empty, and the registration is deleted properly.', () => {
                            cy.visit(`/event/${slug}`);

                            const delBtns = cy.get('[data-cy=delete-button]');

                            delBtns.should('have.length', rows);

                            delBtns.first().should('be.visible');
                            delBtns.first().click();

                            cy.get('[data-cy=confirm-delete-button]').click();
                        });
                    });
                }
            }
        });
    });
});

const signIn = () => {
    cy.session(
        'feide',
        () => {
            cy.visit('/');

            cy.get('[data-cy="min-profil"]').click();

            cy.origin('https://auth.dataporten.no', () => {
                cy.get('[aria-label="Feide test users"]').click();
            });

            const username = feide.username;
            const password = feide.password;

            cy.origin('https://idp.feide.no', { args: { username, password } }, ({ username, password }) => {
                cy.get('input[id=username]').type(username);
                cy.get('input[id=password]').type(password);
                cy.get('button[type=submit]').click();
            });

            cy.visit('/');

            cy.get('[data-cy="min-profil"]').click();

            cy.origin('https://auth.dataporten.no', () => {
                cy.get('[aria-label="Feide test users"]').click();
            });
        },
        {
            validate() {
                cy.visit('/profile');

                cy.get('[data-cy="profile-name"]').should('have.text', feide.name);
                cy.get('[data-cy="profile-email"]').should('have.text', feide.email);
            },
        },
    );
};
