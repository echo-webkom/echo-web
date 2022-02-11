import React from 'react';
import NavBar from '../navbar';
import { render } from './testing-utils';

describe('NavBar', () => {
    test('renders without crashing', () => {
        const btnRef = React.createRef<HTMLButtonElement>();
        const { getByTestId } = render(
            <NavBar
                isOpen={false}
                onClose={() => {
                    return;
                }}
                btnRef={btnRef}
            />,
        );
        expect(getByTestId(/navbar-standard/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        const btnRef = React.createRef<HTMLButtonElement>();
        const { getByTestId } = render(
            <NavBar
                isOpen={false}
                onClose={() => {
                    return;
                }}
                btnRef={btnRef}
            />,
        );
        // navbar buttons exist
        expect(getByTestId(/hjem/i)).toBeInTheDocument();
        expect(getByTestId(/for-studenter/i)).toBeInTheDocument();
        expect(getByTestId(/for-bedrifter/i)).toBeInTheDocument();
        expect(getByTestId(/om-oss/i)).toBeInTheDocument();
        expect(getByTestId(/colormode-button/i)).toBeInTheDocument();
    });
});
