import React from 'react';
import PropTypes from 'prop-types';
import { Text, Button, useColorMode } from '@chakra-ui/core';

import Header from './header';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <>
            <Button pos="fixed" bottom="15px" right="15px" onClick={toggleColorMode}>
                Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
            </Button>
            <Header />
            {children}
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
