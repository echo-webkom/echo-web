import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { getMonth } from 'date-fns';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import NextNProgress from 'nextjs-progressbar';
import React from 'react';
import Snowfall from 'react-snowfall';
import Fonts from '../styles/fonts';
import theme from '../styles/theme';
import Layout from '../components/layout';

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps): JSX.Element => {
    const router = useRouter();
    const SSR = typeof window === 'undefined'; //Used to disable rendering of animated component SS

    return (
        <SessionProvider session={session}>
            <ChakraProvider theme={theme}>
                <NextNProgress
                    color="#29D"
                    startPosition={0.15}
                    stopDelayMs={200}
                    height={4}
                    options={{ showSpinner: false }}
                />
                {!SSR && getMonth(new Date()) === 11 && <Snowfall snowflakeCount={200} color={'#ffffff'} />}
                <Fonts />
                <Layout>
                    <Component {...pageProps} key={router} />
                </Layout>
            </ChakraProvider>
        </SessionProvider>
    );
};

export default App;
