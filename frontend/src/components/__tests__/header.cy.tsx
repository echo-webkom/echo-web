import Header from '../header';

const headerId = '[data-cy=header]';
const drawerButtonId = '[data-cy=drawer-button]';

describe('Header', () => {
    it('renders without crashing', () => {
        cy.mount(<Header />);
        cy.get(headerId).should('exist');
    });

    it('renders correctly', () => {
        cy.mount(<Header />);
        cy.get(headerId).should('exist');
        cy.get('[data-cy=header-logo]').should('exist');
        cy.get('[data-cy=navbar-standard]').should('exist');
        cy.get(drawerButtonId).should('exist');
    });

    it('drawer button opens a Chakra drawer on mobile', () => {
        cy.mount(<Header />);
        const drawerButton = cy.get(drawerButtonId);

        drawerButton.should('exist');
        drawerButton.click({ force: true });
        cy.get('[data-cy=nav-links]').should('exist');
    });
});
