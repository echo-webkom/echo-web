import React from 'react';
import { Center, Flex } from '@chakra-ui/core';

interface Props {
    visible: boolean;
}

const NavBar = ({ visible }: Props): JSX.Element => {
    return (
        <Center>
            <Flex
                display={{ base: visible ? 'block' : 'none', sm: 'flex' }}
                align="center"
                justify="space-between"
                w="480px"
            >
                <p>hjem</p>
                <p>organisasjon</p>
                <p>bedrift</p>
                <p>om oss</p>
            </Flex>
        </Center>
    );
};

export default NavBar;
