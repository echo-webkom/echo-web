import React from 'react';
import { Center, Flex } from '@chakra-ui/core';

const NavBar = (): JSX.Element => {
    return (
        <Center>
            <Flex display={{ base: 'none', sm: 'flex' }} align="center" justify="space-between" w="480px">
                <p>hjem</p>
                <p>organisasjon</p>
                <p>bedrift</p>
                <p>om oss</p>
            </Flex>
        </Center>
    );
};

export default NavBar;
