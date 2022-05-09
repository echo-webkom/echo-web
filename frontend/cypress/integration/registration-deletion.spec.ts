/* eslint-disable @typescript-eslint/no-unsafe-call */
import { happenings } from '../fixtures/happening.json';
import { waitListEmails } from '../fixtures/users.json';

const registrationRoute = 'registration';

describe('Happening registration', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
        });

        for (const { slug } of happenings) {
            for (let rows = 5; rows > 0; rows--) {
                describe('Wait list registrations', () => {
                    beforeEach(() => {
                        cy.visit(`/${registrationRoute}/${slug}`);
                    });

                    it('are moved up when regular registrations are deleted', () => {
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
                describe('Registrations', () => {
                    beforeEach(() => {
                        cy.visit(`/${registrationRoute}/${slug}`);
                    });

                    it('are deleted properly', () => {
                        const delBtns = cy.get('[data-cy=delete-button]');

                        delBtns.should('have.length', rows);

                        delBtns.first().should('be.visible');
                        delBtns.first().click();

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
