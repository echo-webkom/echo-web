import { extendTheme } from '@chakra-ui/core';

// color palette
const palette = {
    transparent: 'transparent',
    black: '#1E1E1E',
    white: '#F7F7F7',
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
    naplesYellow: {
        300: '#FFF6AA',
        400: '#F2D865',
        500: '#BEA74C',
        600: '#8B7633',
        700: '#574419',
        800: '#231300',
    },
    metallicSeaweed: {
        200: '#78D9FF',
        300: '#3CADCA',
        400: '#008094',
        500: '#005E6B',
        600: '#003C42',
        700: '#001A19',
    },
    mardiGras: {
        50: '#E6BFE5',
        100: '#CE8FCE',
        200: '#B560B8',
        300: '#9D30A1',
        400: '#84008B',
        500: '#76007D',
        600: '#67006F',
        700: '#590061',
        800: '#4B0053',
        900: '#3C0045',
    },
};

// global config
const config = {
    useSystemColorMode: false,
    initialColorMode: 'light',
};

// theme
const theme = extendTheme({
    styles: {
        global: ({ colorMode }) => ({
            body: {
                fontFamily: 'body',
                color: colorMode === 'dark' ? palette.white : palette.black,
                bg: colorMode === 'dark' ? palette.black : palette.white,
                lineHeight: 'base',
            },
        }),
    },
    config,
    colors: palette,
});

export default theme;
