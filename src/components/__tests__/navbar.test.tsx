import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './testing-utils';
import NavBar from '../navbar';

describe('NavBar', () => {
    test('renders without crashing', () => {
        const btnRef = React.createRef<HTMLButtonElement>();
        render(<NavBar isOpen={false} onClose={() => {}} btnRef={btnRef} />);
        expect(screen.getByTestId(/navbar-standard/i)).toBeInTheDocument();
    });
});
