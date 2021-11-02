import { extendTheme } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';

const halloweenPallette = {
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
            primary: '#FC9E31',
            secondary: '',
            primaryHover: '#FDB35E',
            secondaryHover: '',
            primaryActive: '#FDB35E',
            secondaryActive: '',
        },
        dark: {
            primary: '#FDB35E',
            secondary: '',
            primaryHover: '#FDC98B',
            secondaryHover: '',
            primaryActive: '#FDC98B',
            secondaryActive: '',
        },
    },
    highlight: {
        light: {
            primary: '#FC9E31',
            secondary: '#A998C3',
        },
        dark: {
            primary: '#FDB35E',
            secondary: '#A998C3',
        },
    },
    orange: {
        50: '#FFF3E6',
        100: '#FEDEB9',
        200: '#FDC98B',
        300: '#FDB35E',
        400: '#FC9E31',
        500: '#FB8904',
        600: '#C96D03',
        700: '#975202',
        800: '#653701',
        900: '#321B01',
    },
    purple: {
        50: '#F2EFF6',
        100: '#D9D2E5',
        200: '#C1B5D4',
        300: '#A998C3',
        400: '#917BB2',
        500: '#785EA1',
        600: '#604B81',
        700: '#483861',
        800: '#302640',
        900: '#181320',
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

const halloweenTheme = extendTheme({
    fonts: {
        heading: 'IBM Plex Serif',
        body: 'Raleway',
    },
    styles: {
        global: ({ colorMode }: { colorMode: string }) => ({
            body: {
                color: colorMode === 'light' ? 'black' : 'white',
                bg: colorMode === 'light' ? 'bg.light.primary' : 'bg.dark.primary',
                lineHeight: 'base',
                // eslint-disable-next-line react-hooks/rules-of-hooks
                fontSize: useBreakpointValue(['1rem', null, '1.25rem']),
            },
        }),
    },
    colors: halloweenPallette,
});

export default halloweenTheme;
