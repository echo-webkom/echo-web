describe('Entry Box', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
        });

        describe('Bedpres Entry Box', () => {
            it('Should link to bedpreses page', () => {
                cy.visit('/');
                cy.get('[data-cy=entry-box-bedpres]').within(() => {
                    cy.get('[data-cy=button-link]').click();
                    cy.url().should('include', '/bedpres');
                });
            });
        });

        describe('Event Entry Box', () => {
            it('Should link to event page', () => {
                cy.visit('/');
                cy.get('[data-cy=entry-box-event]').within(() => {
                    cy.get('[data-cy=button-link]').click();
                    cy.url().should('include', '/event');
                });
            });
        });
    });
});
