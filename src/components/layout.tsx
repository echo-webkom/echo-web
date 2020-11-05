import React from 'react';
import PropTypes from 'prop-types';
import { Center, IconButton, useColorMode } from '@chakra-ui/core';
import { VscColorMode } from 'react-icons/vsc';

import Header from './header';
import Footer from './footer';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    const { colorMode, toggleColorMode } = useColorMode(); // hook for toggling and using color mode

    return (
        <>
            <IconButton // button for toggling color mode
                variant="unstyled"
                icon={
                    <Center>
                        <VscColorMode size="2em" />
                    </Center>
                }
                aria-label="toggle color mode"
                pos="fixed"
                top="15px"
                right="15px"
                onClick={toggleColorMode}
            />
            <Header />
            <Footer />
            {children}
        </>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
