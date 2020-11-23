import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './testing-utils';
import Footer from '../footer';

describe('Footer', () => {
    test('renders without crashing', () => {
        render(<Footer />);
        expect(screen.getByTestId(/footer-standard/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        render(<Footer />);
        expect(screen.getByText(/echo@uib.no/i)).toBeInTheDocument();
        expect(screen.getByText(/Thormøhlensgate 55/i)).toBeInTheDocument();
        expect(screen.getByText(/5069 Bergen/i)).toBeInTheDocument();
        expect(screen.getByText(/Org nr: 000 000 000/i)).toBeInTheDocument();
    });
});
