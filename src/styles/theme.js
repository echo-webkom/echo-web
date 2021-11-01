import { extendTheme } from '@chakra-ui/react';
import { mainTheme } from './themes';

// global config
const config = {
    useSystemColorMode: false,
    initialColorMode: 'light',
};

// theme
const theme = extendTheme({
    ...mainTheme,
    config,
});

export default theme;
