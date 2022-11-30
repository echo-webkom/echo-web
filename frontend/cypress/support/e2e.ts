const signIn = (username: string, password: string, email: string, name: string) => {
    cy.session(
        [username],
        () => {
            cy.visit('/');

            cy.get('[data-cy="min-profil"]').click();

            cy.origin('https://auth.dataporten.no', () => {
                cy.wait(1000);
                cy.get('[aria-label="Feide test users"]').click();
            });

            cy.origin('https://idp.feide.no', { args: { username, password } }, ({ username, password }) => {
                cy.get('input[id=username]').type(username);
                cy.get('input[id=password]').type(password);
                cy.get('button[type=submit]').click();
            });

            cy.visit('/');

            cy.wait(1000);

            cy.get('[data-cy="min-profil"]').click();

            cy.wait(1000);

            cy.origin('https://auth.dataporten.no', () => {
                cy.get('[aria-label="Feide test users"]').click();
                cy.wait(1000);
            });
        },
        {
            validate() {
                cy.visit('/profile');

                cy.get('[data-cy="profile-email"]').should('have.text', email);
                cy.get('[data-cy="profile-name"]').should('have.text', name);
            },
        },
    );
};

export default signIn;
