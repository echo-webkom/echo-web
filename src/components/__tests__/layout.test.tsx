import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './testing-utils';
import Layout from '../layout';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

describe('Layout', () => {
    test('renders without crashing', () => {
        render(
            <Layout>
                <p>test</p>
            </Layout>,
        );
        expect(screen.getByTestId(/layout/i)).toBeInTheDocument();
    });
});
