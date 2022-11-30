import { feide } from '../fixtures/feide.json';
import { happenings } from '../fixtures/happening.json';
import signIn from '../support/e2e';

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    return false;
});

describe('Happening registration', () => {
    describe('720p res', () => {
        for (const { username, password, email, name } of feide) {
            beforeEach(() => {
                cy.viewport(1280, 720);
            });

            for (const { slug } of happenings) {
                describe('Happening form registration', () => {
                    it('should register user to happening', () => {
                        signIn(username, password, email, name);

                        cy.visit(`/event/${slug}`);

                        cy.wait(1000);
                        cy.get('[data-cy=reg-btn]').click();

                        cy.get('li[class=chakra-toast]').contains('Påmeldingen din er registrert!');
                    });
                });
            }
        }
    });
});
