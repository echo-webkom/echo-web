import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './testing-utils';
import Layout from '../layout';

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
