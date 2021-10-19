import { extendTheme } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';

const mainPallette = {
    transparent: 'transparent',
    black: '#000000',
    white: '#ffffff',
    bg: {
        light: {
            primary: '#e6e6e6',
            secondary: '#ffffff',
            tertiary: '#F5F5F5',
            hover: '#F5F5F5',
            border: '#ADADAD',
        },
        dark: {
            primary: '#1E1E1E',
            secondary: '#393939',
            tertiary: '#434343',
            hover: '#434343',
            border: '#808080',
        },
    },
    button: {
        light: {
            primary: '#19A0B3',
            secondary: '',
            primaryHover: '#48D1E5',
            secondaryHover: '',
            primaryActive: '#049fb2',
            secondaryActive: '',
        },
        dark: {
            primary: '#98E5F0',
            secondary: '',
            primaryHover: '#C0EFF6',
            secondaryHover: '',
            primaryActive: '#52afbe',
            secondaryActive: '',
        },
    },
    highlight: {
        light: {
            primary: '#19A0B3',
            secondary: '#FDC42F',
        },
        dark: {
            primary: '#98E5F0',
            secondary: '#FEDE8B',
        },
    },
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

const mainTheme = extendTheme({
    fonts: {
        heading: 'IBM Plex Serif',
        body: 'Raleway',
    },
    styles: {
        global: ({ colorMode }) => ({
            body: {
                color: colorMode === 'light' ? 'black' : 'white',
                bg: colorMode === 'light' ? 'bg.light.primary' : 'bg.dark.primary',
                lineHeight: 'base',
                fontSize: useBreakpointValue(['1rem', null, '1.25rem']),
            },
        }),
    },
    colors: mainPallette,
});

export default mainTheme;
