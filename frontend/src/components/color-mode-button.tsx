import { Box, HStack, Switch, useColorMode, useColorModeValue } from '@chakra-ui/react';
import type { ChangeEvent } from 'react';
import { BsSun } from 'react-icons/bs';
import { BiMoon } from 'react-icons/bi';
import Head from 'next/head';

const ColorModeButton = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const sunBg = useColorModeValue('yellow.500', 'yellow.200');
    const moonBg = useColorModeValue('blue.500', 'blue.200');
    const label = 'colormode-button';

    return (
        <>
            <Head>
                <meta name="theme-color" content={colorMode === 'light' ? '#5bbad5' : '#1e1e1e'} />
            </Head>
            <HStack data-cy={label}>
                <Box color={sunBg}>
                    <BsSun />
                </Box>
                <Switch
                    aria-label={label}
                    size="lg"
                    isChecked={colorMode === 'light' ? false : true}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        if (event.target.checked && colorMode === 'light') toggleColorMode();
                        else if (!event.target.checked && colorMode === 'dark') toggleColorMode();
                    }}
                />
                <Box color={moonBg}>
                    <BiMoon />
                </Box>
            </HStack>
        </>
    );
};

export default ColorModeButton;
