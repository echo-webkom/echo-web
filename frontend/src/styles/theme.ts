import { extendTheme } from '@chakra-ui/react';
import { getYear, isSameDay, isWithinInterval } from 'date-fns';
import { mainTheme, halloweenTheme, christmasTheme } from '@styles/themes';

// global config
const config = {
    useSystemColorMode: false,
    initialColorMode: 'light',
};

const currentTheme = () => {
    const now = new Date();
    const currentYear = getYear(now);

    if (isSameDay(now, new Date(currentYear, 9, 31))) return halloweenTheme;
    else if (isWithinInterval(now, { start: new Date(currentYear, 11, 20), end: new Date(currentYear, 11, 31) }))
        return christmasTheme;

    return mainTheme;
};

// theme
const theme = extendTheme({
    ...currentTheme(),
    config,
});

export default theme;
