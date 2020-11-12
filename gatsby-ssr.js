import React from 'react';
import { ColorModeScript } from '@chakra-ui/core';

import { theme } from './src/styles/globalTheme';

export const onRenderBody = ({ setPreBodyComponents }) => {
    setPreBodyComponents([
        <ColorModeScript initialColorMode={theme.config.initialColorMode} key="chakra-ui-no-flash" />,
    ]);
};
