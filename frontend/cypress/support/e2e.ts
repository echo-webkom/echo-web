const signIn = (email: string, name: string, password: string) => {
    cy.session(
        [password],
        () => {
            cy.visit('/');
            cy.get('[data-cy="min-profil"]').click();

            cy.get('input[id="input-password-for-credentials-provider"]').type(password);
            cy.get('button[type=submit]').click();
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
