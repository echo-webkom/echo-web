import { extendTheme } from '@chakra-ui/react';
import { getMonth } from 'date-fns';
import { mainTheme, halloweenTheme, christmasTheme } from './themes';

// global config
const config = {
    useSystemColorMode: false,
    initialColorMode: 'light',
};

const currentTheme = () => {
    const month = getMonth(new Date());

    if (month === 9) return halloweenTheme;
    else if (month === 11) return christmasTheme;

    return mainTheme;
};

// theme
const theme = extendTheme({
    ...currentTheme(),
    config,
});

export default theme;
