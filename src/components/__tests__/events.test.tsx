import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './testing-utils';
import Events from '../events';

describe('Events', () => {
    test('renders without crashing', () => {
        render(<Events />);
        expect(screen.getByTestId(/events/i)).toBeInTheDocument();
    });
});
