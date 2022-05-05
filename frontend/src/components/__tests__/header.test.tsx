import userEvent from '@testing-library/user-event';
import React from 'react';
import Header from '../header';
import { render } from './testing-utils';

describe('Header', () => {
    test('renders without crashing', () => {
        const { getByTestId } = render(<Header />);
        expect(getByTestId(/header-standard/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        const { getByTestId } = render(<Header />);
        expect(getByTestId(/header-standard/i)).toBeInTheDocument();
        expect(getByTestId(/header-logo/i)).toBeInTheDocument();
        expect(getByTestId(/navbar-standard/i)).toBeInTheDocument();
        expect(getByTestId(/drawer-button/i)).toBeInTheDocument();
    });

    test('drawer button opens a chakra drawer', () => {
        const { getByTestId, getByText } = render(<Header />);
        const drawerButton = getByTestId(/drawer-button/i);
        userEvent.click(drawerButton);
        // drawer exists in DOM
        expect(getByTestId(/navbar-drawer/i)).toBeInTheDocument();
        // Drawer Header exists
        expect(getByText(/navigasjon/i)).toBeInTheDocument();
    });
});
