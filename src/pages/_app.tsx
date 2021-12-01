import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import NextNProgress from 'nextjs-progressbar';
import React from 'react';
import Snowfall from 'react-snowfall';
import Fonts from '../styles/fonts';
import theme from '../styles/theme';
import Layout from '../components/layout';

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const router = useRouter();
    const SSR = typeof window === 'undefined'; //Used to disable rendering of animated component SS

    return (
        <ChakraProvider theme={theme}>
            <NextNProgress
                color="#29D"
                startPosition={0.15}
                stopDelayMs={200}
                height={4}
                options={{ showSpinner: false }}
            />
            {!SSR && <Snowfall snowflakeCount={200} color={'#ffffff'} />}
            <Fonts />
            <Layout>
                <Component {...pageProps} key={router} />
            </Layout>
        </ChakraProvider>
    );
};

export default App;
