import React, { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../../styles/theme';

const AllTheProviders: FunctionComponent = ({ children }) => {
    return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};
AllTheProviders.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AllTheProviders;
