import { extendTheme } from '@chakra-ui/react';
import mainTheme from './themes/main-theme';
import halloweenTheme from './themes/halloween-theme';

// global config
const config = {
    useSystemColorMode: false,
    initialColorMode: 'light',
};

// theme
const theme = extendTheme({
    ...halloweenTheme,
    config,
});

export default theme;
