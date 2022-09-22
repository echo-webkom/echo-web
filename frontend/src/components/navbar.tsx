import {
    Box,
    Center,
    Text,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Heading,
    Icon,
    IconButton,
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverHeader,
    PopoverBody,
    GridItem,
} from '@chakra-ui/react';
import type { RefObject } from 'react';
import { useContext } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ColorModeButton from '@components/color-mode-button';
import { DesktopNavLink } from '@components/nav-link';
import LanguageContext from 'language-context';
import { routes } from 'routes';

const NavLinks = ({ isMobile }: { isMobile: boolean }): JSX.Element => {
    const isNorwegian = useContext(LanguageContext);
    const { status } = useSession();
    const router = useRouter();
    const onProfileClick = () => {
        if (status === 'authenticated') {
            void router.push('/profile');
        } else {
            void signIn('feide');
        }
    };

    return (
        <Flex
            flexDirection={['column', null, null, 'row']}
            w="100%"
            fontSize={['3xl', null, null, 'lg', '2xl']}
            justify="flex-end"
            alignItems="center"
            gap="5"
        >
            <Flex gap="5">
                {routes.map((route) => {
                    return <DesktopNavLink {...route} />;
                })}
            </Flex>

            <ColorModeButton />
            {!isMobile && (
                <IconButton
                    data-cy="min-profil"
                    aria-label={status === 'authenticated' ? 'Gå til profil' : 'Logg inn'}
                    onClick={() => void onProfileClick()}
                    variant="ghost"
                    icon={
                        <Center>
                            <Icon as={AiOutlineUser} boxSize={7} />
                        </Center>
                    }
                />
            )}
        </Flex>
    );
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    btnRef: RefObject<HTMLButtonElement>;
}

const NavBar = ({ isOpen, onClose, btnRef }: Props): JSX.Element => {
    const isNorwegian = useContext(LanguageContext);
    return (
        <>
            <Box flex="2 1 auto" data-cy="navbar-standard" pb="1rem" pl={['0.5rem', null, null, null, '3rem', '4rem']}>
                <Flex
                    display={['none', null, null, 'flex']}
                    align="center"
                    justify="space-between"
                    w="full"
                    direction="column"
                >
                    <NavLinks isMobile={false} />
                </Flex>
            </Box>
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
                <DrawerOverlay>
                    <DrawerContent data-cy="navbar-drawer">
                        <DrawerCloseButton size="lg" />
                        <DrawerHeader fontSize="2xl" as={Heading}>
                            {isNorwegian ? 'Navigasjon' : 'Navigation'}
                        </DrawerHeader>
                        <DrawerBody>
                            <Box onClick={onClose} data-cy="nav-links">
                                <NavLinks isMobile />
                            </Box>
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </>
    );
};

export default NavBar;
