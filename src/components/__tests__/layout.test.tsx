import { screen } from '@testing-library/react';
import React from 'react';
import Layout from '../layout';
import { render } from './testing-utils';

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
