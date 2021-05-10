describe('Nav Menus', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
        });

        describe('When visiting the home page', () => {
            it('Should visit homepage', () => {
                cy.visit('/');
            });

            describe('navbar', () => {
                it('Should navigate to om-echo page', () => {
                    cy.get('[data-cy=nav-item]').contains('Om echo').click();
                    cy.url().should('include', '/om-oss');
                });
            });
        });
    });
});
