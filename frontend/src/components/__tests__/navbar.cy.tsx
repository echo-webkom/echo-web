import { createRef } from 'react';
import NavBar from '@components/navbar';

describe('NavBar', () => {
    it('renders without crashing', () => {
        const btnRef = createRef<HTMLButtonElement>();
        cy.mount(
            <NavBar
                isOpen={false}
                onClose={() => {
                    return;
                }}
                btnRef={btnRef}
            />,
        );
        cy.get('[data-cy=navbar-standard]').should('exist');
    });

    it('renders correctly', () => {
        const btnRef = createRef<HTMLButtonElement>();
        cy.mount(
            <NavBar
                isOpen={false}
                onClose={() => {
                    return;
                }}
                btnRef={btnRef}
            />,
        );

        cy.get('[data-cy=hjem]').should('exist');
        cy.get('[data-cy=om-oss]').should('exist');
        cy.get('[data-cy=colormode-button]').should('exist');
    });
});
