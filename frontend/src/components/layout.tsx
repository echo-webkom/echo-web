import { Box, Flex, Spacer } from '@chakra-ui/react';
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
            <Flex direction="column" minH="100vh" data-testid="layout">
                <Header />
                <Box maxW="1500" w={['97%', null, null, '90%']} m="auto">
                    {children}
                </Box>
                <FeedbackButton />
                <Spacer py="2" />
                <Footer />
            </Flex>
        </AnimatedIcons>
    );
};

export default Layout;
