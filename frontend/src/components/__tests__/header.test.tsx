import userEvent from '@testing-library/user-event';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import Header from '../header';
import { render } from './testing-utils';

describe('Header', () => {
    test('renders without crashing', async () => {
        render(<Header />);
        const header = screen.getByTestId(/header-standard/i);

        await waitFor(() => header);

        expect(header).toBeInTheDocument();
    });

    test('renders correctly', async () => {
        render(<Header />);
        const header = screen.getByTestId(/header-standard/i);
        const headerLogo = screen.getByTestId(/header-logo/i);
        const navbarStandard = screen.getByTestId(/navbar-standard/i);
        const drawerButton = screen.getByTestId(/drawer-button/i);

        await waitFor(() => header);
        await waitFor(() => headerLogo);
        await waitFor(() => navbarStandard);
        await waitFor(() => drawerButton);

        expect(header).toBeInTheDocument();
        expect(headerLogo).toBeInTheDocument();
        expect(navbarStandard).toBeInTheDocument();
        expect(drawerButton).toBeInTheDocument();
    });

    test('drawer button opens a chakra drawer', async () => {
        const user = userEvent.setup();
        render(<Header />);
        const drawerButton = screen.getByTestId(/drawer-button/i);

        await waitFor(() => drawerButton);
        expect(drawerButton).toBeInTheDocument();

        await user.click(drawerButton);

        const navText = screen.getByText(/navigasjon/i);
        await waitFor(() => navText);

        expect(navText).toBeInTheDocument();
    });
});
