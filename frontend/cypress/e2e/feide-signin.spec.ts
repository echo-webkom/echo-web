/* eslint-disable @typescript-eslint/no-unsafe-call */
import feide from '../fixtures/feide.json';

describe('Feide sign in', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
            signIn();
            cy.visit('/profile');
        });

        describe('Feide sign in', () => {
            it('Can sign in with Feide and reach profile page', () => {
                cy.url().should('contain', 'profile');
            });

            it('Can submit profile info', () => {
                cy.get('[data-cy="profile-degree"]').select(feide.degree);
                cy.get('[data-cy="profile-degree-year"]').select(feide.degreeYear);

                cy.get('button[type=submit]').click();
                cy.get('button[type=submit]').should('contain', 'Endringer lagret!');
            });

            it('Profile info should be persisted', () => {
                cy.get('[data-cy="profile-degree"]').should('contain', feide.degree);
                cy.get('[data-cy="profile-degree-year"]').should('contain', feide.degreeYear);
            });
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

            cy.origin('https://idp.feide.no', () => {
                cy.get('input[id=username]').type(Cypress.env('FEIDE_USERNAME'));
                cy.get('input[id=password]').type(Cypress.env('FEIDE_PASSWORD'));
                cy.get('button[type=submit]').click();
            });
        },
        {
            validate() {
                cy.visit('/profile');

                cy.get('[data-cy="profile-name"]').should('contain', Cypress.env('FEIDE_FULL_NAME'));
                cy.get('[data-cy="profile-email"]').should('contain', Cypress.env('FEIDE_EMAIL'));
            },
        },
    );
};
