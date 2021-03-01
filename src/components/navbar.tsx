import React, { RefObject } from 'react';
import NextLink from 'next/link';
import { VscColorMode } from 'react-icons/vsc';
import {
    Center,
    Box,
    Grid,
    Text,
    Flex,
    IconButton,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useColorMode,
    Link,
} from '@chakra-ui/react';

const NavLink = ({ href, text }: { href: string; text: string }) => {
    return (
        <Link as={NextLink} href={href}>
            <Text cursor="pointer" fontSize={{ sm: 'sm', md: 'md', lg: 'lg', xl: '2xl' }}>
                {text}
            </Text>
        </Link>
    );
};

interface NavProps {
    toggleColorMode: () => void;
}

const Nav = ({ toggleColorMode }: NavProps): JSX.Element => (
    <Flex
        w="100%"
        fontSize={{ sm: 'sm', lg: 'lg' }}
        justifyContent="space-between"
        textAlign="end"
        alignItems="flex-end"
        pl={{ lg: '0.5rem', xl: '2rem' }}
    >
        <NavLink text="Hjem" href="/" />
        <NavLink text="For Studenter" href="/for-studenter" />
        <NavLink text="For Bedrifter" href="/for-bedrifter" />
        <NavLink text="Om echo" href="/om-oss" />
        <IconButton // button for toggling color mode
            variant="unstyled"
            icon={
                <Center>
                    <VscColorMode size="2em" />
                </Center>
            }
            aria-label="toggle color mode"
            onClick={toggleColorMode}
        />
    </Flex>
);

interface Props {
    isOpen: boolean;
    onClose: () => void;
    btnRef: RefObject<HTMLButtonElement>;
}

const NavBar = ({ isOpen, onClose, btnRef }: Props): JSX.Element => {
    const { toggleColorMode } = useColorMode(); // hook for toggling and using color mode

    return (
        <>
            <Box data-testid="navbar-standard" flex="2 1 auto">
                <Flex display={['none', null, null, 'flex']} align="center" justify="space-between" w="full">
                    <Nav toggleColorMode={toggleColorMode} />
                </Flex>
            </Box>
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
                <DrawerOverlay>
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Navigasjon</DrawerHeader>
                        <DrawerBody>
                            <Nav toggleColorMode={toggleColorMode} />
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </>
    );
};

export default NavBar;
