import { Box } from '@chakra-ui/react';
import React from 'react';
import Footer from './footer';
import Header from './header';
import AnimatedIcons from './animated-icons';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    return (
        <Box overflow="hidden" pos="relative" minHeight="100vh" data-testid="layout">
            <AnimatedIcons n={50}>
                <Header />
                <Box
                    maxW="2000"
                    w="100%"
                    m="auto"
                    px={['5%', '100px']}
                    pb={['380px', '300px', '200px', '160px', '160px']}
                >
                    {children}
                </Box>
                <Footer />
            </AnimatedIcons>
        </Box>
    );
};

export default Layout;
