import { email, name, password } from '../fixtures/user.json';
import { happenings } from '../fixtures/happening.json';
import signIn from '../support/e2e';

describe('Happening registration', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
            signIn(email, name, password);
        });

        for (const { slug } of happenings) {
            describe('Happening form registration', () => {
                it('should register user to happening', () => {
                    cy.visit(`/event/${slug}`);

                    cy.wait(1000);
                    cy.get('[data-cy=reg-btn]').click();

                    cy.get('li[class=chakra-toast]').contains('Påmeldingen din er registrert!');
                });
            });
        }
    });
});
