import Footer from '../footer';

const compId = '[data-testid=footer]';

describe('Footer', () => {
    it('renders without crashing', () => {
        cy.mount(<Footer />);
    });

    it('renders correctly', () => {
        cy.mount(<Footer />);
        const footer = cy.get(compId);

        footer.should('contain', 'Thormøhlensgate 55');
        footer.should('contain', '5006 Bergen');
        footer.should('contain', 'Org nr: 998 995 035');
    });
});
