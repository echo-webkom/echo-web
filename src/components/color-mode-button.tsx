import { Box, HStack, Switch, useColorMode, useColorModeValue } from '@chakra-ui/react';
import React, { ChangeEvent } from 'react';
import { BsSun } from 'react-icons/bs';
import { BiMoon } from 'react-icons/bi';

const ColorModeButton = (): JSX.Element => {
    const { colorMode, toggleColorMode } = useColorMode();
    const sunBg = useColorModeValue('yellow.500', 'yellow.200');
    const moonBg = useColorModeValue('blue.500', 'blue.200');

    return (
        <HStack data-testid="button-colormode">
            <Box color={sunBg}>
                <BsSun />
            </Box>
            <Switch
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
    );
};

export default ColorModeButton;
