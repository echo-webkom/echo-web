/* eslint-disable react/jsx-props-no-spreading */
import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import NProgress from 'nprogress';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Fonts from '../styles/fonts';
import theme from '../styles/theme';

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    const router = useRouter();

    useEffect(() => {
        const routeChangeStart = () => NProgress.start();
        const routeChangeComplete = () => NProgress.done();

        router.events.on('routeChangeStart', routeChangeStart);
        router.events.on('routeChangeComplete', routeChangeComplete);
        router.events.on('routeChangeError', routeChangeComplete);
        return () => {
            router.events.off('routeChangeStart', routeChangeStart);
            router.events.off('routeChangeComplete', routeChangeComplete);
            router.events.off('routeChangeError', routeChangeComplete);
        };
    }, [router]);

    return (
        <ChakraProvider theme={theme}>
            <Head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
                />
            </Head>
            <Fonts />
            <Component {...pageProps} key={router} />
        </ChakraProvider>
    );
};

export default App;
