import React from 'react';
import { ChakraProvider } from '@chakra-ui/core';

import { theme } from './src/styles/globalTheme';

export const wrapRootElement = ({ element }) => <ChakraProvider theme={theme}>{element}</ChakraProvider>;
