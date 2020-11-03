import React from 'react';
import PropTypes from 'prop-types';
import { Center, IconButton, useColorMode } from '@chakra-ui/core';
import { VscColorMode } from 'react-icons/vsc';

import Header from './header';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <>
            <IconButton
                variant="unstyled"
                icon={
                    <Center>
                        <VscColorMode size="2em" />
                    </Center>
                }
                aria-label="toggle color mode"
                pos="fixed"
                bottom="15px"
                right="15px"
                onClick={toggleColorMode}
            />
            <Header />
            {children}
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
