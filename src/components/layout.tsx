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
                    maxW="1500"
                    w="90%"
                    m="auto"
                    px={['0', '5%', '50']}
                    pb={['610px', '320px', '200px', '160px', '180px']}
                    mb={['70', '50']}
                >
                    {children}
                </Box>
                <Footer />
            </AnimatedIcons>
        </Box>
    );
};

export default Layout;
