import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './testing-utils';
import Header from '../header';

describe('Header', () => {
    test('renders without crashing', () => {
        render(<Header />);
        expect(screen.getByTestId(/header-standard/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        render(<Header />);
        expect(screen.getByText(/Hjem/i)).toBeInTheDocument();
        expect(screen.getByText(/Organisasjon/i)).toBeInTheDocument();
        expect(screen.getByText(/Bedrift/i)).toBeInTheDocument();
        expect(screen.getByText(/Om oss/i)).toBeInTheDocument();
    });
});
