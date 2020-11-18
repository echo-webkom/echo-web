/* eslint-disable react/jsx-props-no-spreading */
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../styles/theme';

import client from '../lib/apollo/apollo';

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
    return (
        <ApolloProvider client={client}>
            <ChakraProvider theme={theme}>
                <Component {...pageProps} />
            </ChakraProvider>
        </ApolloProvider>
    );
};

export default App;
