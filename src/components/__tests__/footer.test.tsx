import { screen } from '@testing-library/react';
import React from 'react';
import Footer from '../footer';
import { render } from './testing-utils';

describe('Footer', () => {
    test('renders without crashing', () => {
        render(<Footer />);
        expect(screen.getByTestId(/footer/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        render(<Footer />);
        expect(screen.getByText(/thormøhlensgate 55/i)).toBeInTheDocument();
        expect(screen.getByText(/5006 bergen/i)).toBeInTheDocument();
        expect(screen.getByText(/org nr: 998 995 035/i)).toBeInTheDocument();
    });
});
