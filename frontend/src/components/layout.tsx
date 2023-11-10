import { useSound } from 'use-sound';
import { Alert, AlertIcon, Box, Center, Flex, Spacer } from '@chakra-ui/react';
import { getMonth, isFuture } from 'date-fns';
import { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';
import CountdownLink from './countdown';
import AnimatedIcons from '@components/animated-icons';
import FeedbackButton from '@components/feedback-button';
import Footer from '@components/footer';
import Header from '@components/header';

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    // https://nextjs.org/docs/messages/react-hydration-error
    const [SSR, setSSR] = useState(true);
    const [backendError, setBackendError] = useState(false);
    const [play] = useSound('../tradeoffer.ogg');

    useEffect(() => {
        setSSR(false);

        const pingBackend = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'}/status`);
                setBackendError(!res.ok);
            } catch {
                setBackendError(true);
            }
        };

        void pingBackend();
    }, []);

    const progbardate = new Date('2023-09-16T19:00:00');

    return (
        <AnimatedIcons n={50}>
            {!SSR && getMonth(new Date()) === 11 && (
                <Snowfall style={{ zIndex: -1 }} snowflakeCount={200} color="#ffffff" />
            )}
            <Flex direction="column" minH="100vh" data-testid="layout">
                {isFuture(progbardate) && <CountdownLink title="Programmerbar åpner snart!" endAt={progbardate} />}
                {backendError && (
                    <Center>
                        <Alert onMouseEnter={() => play()} borderRadius="0.5rem" m="1rem" maxW="600px" status="warning">
                            <AlertIcon />
                            Vi opplever for tiden problemer med backenden. Dette kan føre til at noen funksjoner ikke
                            fungerer som de skal. Webkom jobber med å løse problemet så fort som mulig.
                        </Alert>
                    </Center>
                )}
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
