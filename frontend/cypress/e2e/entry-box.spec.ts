describe('Entry Box', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
        });

        describe('Bedpres Entry Box', () => {
            it('Should link to bedpreses page', () => {
                const bedpresPage = '/arrangementer';

                cy.visit('/');
                cy.get('[data-cy=entry-box-bedpres]').within(() => {
                    cy.get(`[data-cy="${bedpresPage}"]`).click();
                    cy.url().should('include', bedpresPage);
                });
            });
        });

        describe('Event Entry Box', () => {
            it('Should link to event page', () => {
                const eventPage = '/arrangementer';

                cy.visit('/');
                cy.get('[data-cy=entry-box-event]').within(() => {
                    cy.get(`[data-cy="${eventPage}"]`).click();
                    cy.url().should('include', eventPage);
                });
            });
        });
    });
});
