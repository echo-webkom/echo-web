describe('Bedpres registration', () => {
    describe('720p res', () => {
        beforeEach(() => {
            cy.viewport(1280, 720);
        });

        context('Bedpres form registration', () => {
            const slug = 'bedriftspresentasjon-med-bekk';

            beforeEach(() => {
                cy.visit(`/bedpres/${slug}`);
            });

            it('Popup form appears correctly', () => {
                cy.get('[data-cy=reg-btn]').click();
                cy.get('[data-cy=reg-form]').should('be.visible');

                cy.get('input[name=email]').should('be.visible');
                cy.get('input[name=firstName]').should('be.visible');
                cy.get('input[name=lastName]').should('be.visible');
                cy.get('select[name=degree]').should('be.visible');

                /*
                 
                Chakra hides radio and checkbox input beneath another element,
                therefore it will never be visible.

                cy.get('input[name=degreeYear]').should('be.visible');
                cy.get('input[name=terms1]').should('be.visible');
                cy.get('input[name=terms2]').should('be.visible');
                cy.get('input[name=terms3]').should('be.visible');

               */
            });

            it('User can sign up with valid input', () => {
                const user = {
                    email: 'test@test.com',
                    firstName: 'Test',
                    lastName: 'McTest',
                    degree: 'DTEK',
                    degreeYear: 3,
                };

                cy.get('[data-cy=reg-btn]').click();
                cy.get('[data-cy=reg-form]').should('be.visible');

                cy.get('input[name=email]').type(user.email);
                cy.get('input[name=firstName]').type(user.firstName);
                cy.get('input[name=lastName]').type(user.lastName);
                cy.get('select[name=degree]').select(user.degree);
                cy.get('input[name=degreeYear]').check(user.degreeYear.toString(), { force: true });
                cy.get('input[name=terms1]').check({ force: true });
                cy.get('input[name=terms2]').check({ force: true });
                cy.get('input[name=terms3]').check({ force: true });

                cy.get('button[type=submit]').click();

                cy.wait(5000);

                cy.get('li[class=chakra-toast]').contains('Påmeldingen din er registrert!');
            });
        });
    });
});
