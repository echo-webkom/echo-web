import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import React, { FunctionComponent } from 'react';
import theme from '../../styles/theme';

const AllTheProviders: FunctionComponent = ({ children }) => {
    return (
        <SessionProvider
            session={{
                expires: new Date(Date.now() + 2 * 86400).toISOString(),
                user: { name: 'admin' },
            }}
        >
            <ChakraProvider theme={theme}>{children}</ChakraProvider>
        </SessionProvider>
    );
};

export default AllTheProviders;
