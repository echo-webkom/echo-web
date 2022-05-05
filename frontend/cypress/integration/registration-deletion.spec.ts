/* eslint-disable @typescript-eslint/no-unsafe-call */
import { happenings } from '../fixtures/happening.json';

const registrationRoute = 'registration';

describe('Happening registration', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
        });

        for (const { slug } of happenings) {
            for (let rows = 20; rows > 0; rows--) {
                describe('Happening registration deletion', () => {
                    beforeEach(() => {
                        cy.visit(`/${registrationRoute}/${slug}`);
                    });

                    it('Registrations are deleted properly', () => {
                        cy.get('[data-cy=reg-row]').should('have.length', rows);
                        cy.get('[data-cy=delete-button]').first().should('be.visible');
                        cy.get('[data-cy=delete-button]').first().click();

                        cy.get('[data-cy=confirm-delete-button]').click();
                    });
                });
            }
        }

        after(() => {
            for (const { slug } of happenings) {
                cy.visit(`/${registrationRoute}/${slug}`);
                cy.get('[data-cy=no-regs]').should('be.visible');
                cy.get('[data-cy=no-regs]').should('contain.text', 'Ingen påmeldinger enda');
            }
        });
    });
});
