import { Box, Flex, Spacer } from '@chakra-ui/react';
import { getMonth } from 'date-fns';
import Snowfall from 'react-snowfall';
import { useState, useEffect } from 'react';
import Footer from '@components/footer';
import Header from '@components/header';
import AnimatedIcons from '@components/animated-icons';
import FeedbackButton from '@components/feedback-button';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
    // https://nextjs.org/docs/messages/react-hydration-error
    const [SSR, setSSR] = useState(true);

    useEffect(() => {
        setSSR(false);
    }, []);

    return (
        <AnimatedIcons n={50}>
            {!SSR && getMonth(new Date()) === 11 && (
                <Snowfall style={{ zIndex: -1 }} snowflakeCount={200} color="#ffffff" />
            )}
            <Flex direction="column" minH="100vh" data-testid="layout">
                <Header />
                <Box maxW="1500" w="full" px={['0.5rem', '1.5rem', null, '3rem']} mx="auto">
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
