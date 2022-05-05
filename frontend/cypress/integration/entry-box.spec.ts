/* eslint-disable @typescript-eslint/no-unsafe-call */

describe('Entry Box', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
        });

        describe('Bedpres Entry Box', () => {
            it('Should link to bedpreses page', () => {
                const bedpresPage = '/bedpres';

                cy.visit('/');
                cy.get('[data-cy=entry-box-bedpres]').within(() => {
                    cy.get(`[data-cy="${bedpresPage}"]`).click();
                    cy.url().should('include', bedpresPage);
                });
            });
        });

        describe('Event Entry Box', () => {
            it('Should link to event page', () => {
                const eventPage = '/event';

                cy.visit('/');
                cy.get('[data-cy=entry-box-event]').within(() => {
                    cy.get(`[data-cy="${eventPage}"]`).click();
                    cy.url().should('include', eventPage);
                });
            });
        });
    });
});
