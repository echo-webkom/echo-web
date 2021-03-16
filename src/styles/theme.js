import { extendTheme } from '@chakra-ui/react';

// color palette
const palette = {
    transparent: 'transparent',
    black: '#000000',
    white: '#ffffff',
    bg1Light: '#dfdfdf',
    bg2Light: '#ffffff',
    bg1Dark: '#1E1E1E',
    bg2Dark: '#2D2D2D',
    vermillion: '#333a56',
    fresh: '#52658f',
    gray: {
        50: '#F5F5F5',
        100: '#DFDFDF',
        200: '#C8C8C8',
        300: '#B2B2B2',
        400: '#9C9C9C',
        500: '#868686',
        600: '#6F6F6F',
        700: '#595959',
        800: '#434343',
        900: '#2D2D2D',
    },
};

// global config
const config = {
    useSystemColorMode: false,
    initialColorMode: 'light',
};

// theme
const theme = extendTheme({
    fonts: {
        heading: 'IBM Plex Serif',
        body: 'Raleway',
    },
    styles: {
        global: ({ colorMode }) => ({
            body: {
                color: colorMode === 'light' ? palette.black : palette.white,
                bg: colorMode === 'light' ? palette.bg1Light : palette.bg1Dark,
                lineHeight: 'base',
                fontSize: '1.25rem',
            },
        }),
    },
    config,
    colors: palette,
});

export default theme;
