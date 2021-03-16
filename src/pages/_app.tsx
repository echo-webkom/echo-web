/* eslint-disable react/jsx-props-no-spreading */
import type { AppProps } from 'next/app';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../styles/theme';
import { Fonts } from '../styles/fonts';

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    return (
        <ChakraProvider theme={theme}>
            <Fonts />
            <Component {...pageProps} />
        </ChakraProvider>
    );
};

export default App;
