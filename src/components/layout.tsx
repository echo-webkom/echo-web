import { Box } from '@chakra-ui/react';
import React from 'react';
import Footer from './footer';
import Header from './header';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    return (
        <>
            <Box pos="relative" minHeight="100vh" data-testid="layout" maxW="1700" m="auto">
                <Header />
                <Box px={['5%', '10%']} pb={['380px', '300px', '200px', '160px', '160px']}>
                    {children}
                </Box>
            </Box>
            <Footer />
        </>
    );
};

export default Layout;
