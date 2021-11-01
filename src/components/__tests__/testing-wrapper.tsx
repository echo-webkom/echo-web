import { ChakraProvider } from '@chakra-ui/react';
import React, { FunctionComponent } from 'react';
import theme from '../../styles/theme';

const AllTheProviders: FunctionComponent = ({ children }) => {
    return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

export default AllTheProviders;
