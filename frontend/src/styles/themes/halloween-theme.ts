import mainTheme, { defaultPalette } from '@styles/themes/main-theme';

const halloweenPalette = {
    ...defaultPalette,
    text: {
        dark: {
            primary: '#ffffff',
            secondary: '#000000',
        },
        light: {
            primary: '#000000',
            secondary: '#ffffff',
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
            text: '#ffffff',
        },
        dark: {
            primary: '#FDB35E',
            secondary: '',
            primaryHover: '#FDC98B',
            secondaryHover: '',
            primaryActive: '#FDC98B',
            secondaryActive: '',
            text: '#000000',
        },
    },
    highlight: {
        light: {
            primary: '#FC9E31',
            secondary: '#A998C3',
            tertiary: '#F2EFF6',
        },
        dark: {
            primary: '#FDB35E',
            secondary: '#A998C3',
            tertiary: '#302640',
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
};

const halloweenTheme = {
    ...mainTheme,
    colors: halloweenPalette,
};

export default halloweenTheme;
