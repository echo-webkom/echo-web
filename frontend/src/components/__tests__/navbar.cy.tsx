import { DesktopNavBar, MobileNavBar } from '@components/navbar';
import routes from 'routes';

describe('DesktopNavbar', () => {
    it('renders without crashing', () => {
        cy.mount(<DesktopNavBar />);
        cy.get('[data-cy=navbar-standard]').should('exist');
    });

    it('renders correctly', () => {
        cy.mount(<DesktopNavBar />);

        routes.map((route) => {
            cy.get(`[data-cy=${route.dataCy}]`).should('exist');
        });
    });
});

describe('MobileNavbar', () => {
    it('renders without crashing', () => {
        cy.mount(<MobileNavBar />);
        cy.get('[data-cy=drawer-button]').should('exist');
    });

    it('renders correctly', () => {
        cy.mount(<MobileNavBar />);

        cy.get('[data-cy=drawer-button]').should('exist');
        cy.get('[data-cy=drawer-button]').click();

        routes.map((route) => {
            cy.get(`[data-cy=${route.dataCy}]`).should('exist');
        });
    });
});
