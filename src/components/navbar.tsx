import React, { RefObject } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { VscColorMode } from 'react-icons/vsc';
import {
    Center,
    Box,
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
    LinkBox,
    LinkOverlay,
    Heading,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';

const NavLink = ({ href, text, testid }: { href: string; text: string; testid?: string }) => {
    const router = useRouter();
    const isActive = router?.pathname === href || '';

    return (
        <LinkBox data-testid={testid}>
            <NextLink href={href} passHref>
                <LinkOverlay as={Link} textDecoration={isActive ? 'underline' : ''} py="0.2rem" px="0.4rem">
                    {text}
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

NavLink.defaultProps = {
    testid: null,
};

interface NavProps {
    toggleColorMode: () => void;
}

const Nav = ({ toggleColorMode }: NavProps): JSX.Element => (
    <Flex
        flexDirection={['column', null, null, 'row']}
        w="100%"
        fontSize={['3xl', null, null, 'lg', '2xl']}
        justifyContent="space-between"
        textAlign="end"
        alignItems="flex-end"
    >
        <NavLink text="Hjem" href="/" testid="hjem" />
        <NavLink text="For Studenter" href="/for-studenter" testid="for-studenter" />
        <NavLink text="For Bedrifter" href="/for-bedrifter" testid="for-bedrifter" />
        <NavLink text="Om echo" href="/om-oss" testid="om-oss" />
        <IconButton // button for toggling color mode
            variant="unstyled"
            icon={
                <Center>
                    <Icon as={VscColorMode} boxSize={8} />
                </Center>
            }
            aria-label="toggle color mode"
            onClick={toggleColorMode}
            data-testid="button-colormode"
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
            <Box flex="2 1 auto" data-testid="navbar-standard" pb="1rem" pl="1rem">
                <Flex
                    display={['none', null, null, 'flex']}
                    align="center"
                    justify="space-between"
                    w="full"
                    direction="column"
                >
                    <Nav toggleColorMode={toggleColorMode} />
                </Flex>
            </Box>
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
                <DrawerOverlay>
                    <DrawerContent data-testid="navbar-drawer">
                        <DrawerCloseButton size="lg" />
                        <DrawerHeader fontSize="2xl" as={Heading}>
                            Navigasjon
                        </DrawerHeader>
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
