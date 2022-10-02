import { Box } from '@chakra-ui/react';
import Footer from '@components/footer';
import Header from '@components/header';
import AnimatedIcons from '@components/animated-icons';
import FeedbackButton from '@components/feedback-button';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    return (
        <AnimatedIcons n={50}>
            <Box overflow="hidden" pos="relative" minHeight="100vh" data-testid="layout">
                <Header />
                <Box
                    maxW="1500"
                    w={['97%', null, null, '90%']}
                    m="auto"
                    px={['0', '5%', '50']}
                    pb={['610px', '370px', '250px', '200px', '200px']}
                    mb={['70', '50']}
                >
                    {children}
                </Box>
                <FeedbackButton />
                <Footer />
            </Box>
        </AnimatedIcons>
    );
};

export default Layout;
