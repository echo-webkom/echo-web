import {
    Box,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Heading,
    Link,
    LinkBox,
    LinkOverlay,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { RefObject } from 'react';
import ColorModeButton from './color-mode-button';

const NavLink = ({ href, text, testid }: { href: string; text: string; testid?: string }) => {
    const router = useRouter();
    const isActive = router?.pathname === href || '';

    return (
        <LinkBox data-testid={testid} data-cy="nav-item">
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

const Nav = (): JSX.Element => (
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
        <ColorModeButton />
    </Flex>
);

interface Props {
    isOpen: boolean;
    onClose: () => void;
    btnRef: RefObject<HTMLButtonElement>;
}

const NavBar = ({ isOpen, onClose, btnRef }: Props): JSX.Element => {
    return (
        <>
            <Box
                flex="2 1 auto"
                data-testid="navbar-standard"
                pb="1rem"
                pl={['0.5rem', null, null, null, '3rem', '4rem']}
            >
                <Flex
                    display={['none', null, null, 'flex']}
                    align="center"
                    justify="space-between"
                    w="full"
                    direction="column"
                >
                    <Nav />
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
                            <Nav />
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </>
    );
};

export default NavBar;
