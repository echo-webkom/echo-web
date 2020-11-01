import React from 'react';
import { extendTheme, mode } from '@chakra-ui/core';

// color palette
const palette = {
    transparent: 'transparent',
    black: '#1E1E1E',
    white: '#F7F7F7',
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
};

// global config
const config = {
    useSystemColorMode: false,
    initialColorMode: 'light',
};

// theme
export const theme = extendTheme({
    config,
    colors: palette,
});
