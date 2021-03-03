import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';

import Header from './header';
import Footer from './footer';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    return (
        <Box pos="relative" minHeight="100vh" data-testid="layout">
            <Header />
            <Box px={['5%', '10%']} pb={['450px', '260px']}>
                {children}
            </Box>
            <Footer />
        </Box>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
