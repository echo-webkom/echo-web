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
    Accordion,
    AccordionItem,
    AccordionPanel,
    AccordionButton,
    AccordionIcon,
    useDisclosure,
    Spacer,
    LinkBox,
} from '@chakra-ui/react';
import { RefObject, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import ColorModeButton from '@components/color-mode-button';
import { DesktopNavLink } from '@components/nav-link';
import LanguageContext from 'language-context';
import { routes } from 'routes';
import { IoIosMenu, IoMdClose } from 'react-icons/io';
import NextLink from 'next/link';
import LanguageMenu from './language-menu';

export const DesktopNavBar = () => {
    return (
        <Box display={['none', null, null, null, 'block']}>
            <Flex direction="row" gap="5" alignItems="center">
                {routes.map((route) => {
                    return <DesktopNavLink {...route} />;
                })}
                <ColorModeButton />
                <ProfileButton />
            </Flex>
        </Box>
    );
};

export const MobileNavBar = () => {
    const { status } = useSession();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const router = useRouter();

    const isNorwegian = useContext(LanguageContext);
    const lang = isNorwegian ? 'no' : 'en';

    const btnRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            <IconButton
                variant="unstyled"
                ref={btnRef}
                onClick={onOpen}
                display={['block', null, null, null, 'none']}
                aria-label="show navbar"
                icon={
                    <Center>
                        <Icon as={IoIosMenu} boxSize={10} />
                    </Center>
                }
                data-cy="drawer-button"
            />

            <Drawer
                isOpen={isOpen}
                size={['xs', null, null, 'sm']}
                placement="right"
                onClose={onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay>
                    <DrawerContent data-cy="navbar-drawer">
                        <DrawerHeader>
                            <Flex direction="row" alignItems="center">
                                <ColorModeButton />
                                <Spacer />
                                <IconButton
                                    as={IoMdClose}
                                    onClick={onClose}
                                    variant="unstyled"
                                    aria-label="Close menu"
                                    cursor="pointer"
                                    size="sm"
                                />
                            </Flex>
                        </DrawerHeader>
                        <DrawerBody p="0">
                            <Box data-cy="nav-links">
                                <Accordion w="100%" allowMultiple allowToggle>
                                    {routes.map((route) => {
                                        return (
                                            <AccordionItem>
                                                <AccordionButton>
                                                    <AccordionIcon mr="1" />
                                                    <Text fontSize="2xl">{route.title[lang]}</Text>
                                                </AccordionButton>
                                                <AccordionPanel>
                                                    <Flex direction="column">
                                                        {route.children.map((child) => {
                                                            return (
                                                                <NextLink href={child.path} passHref>
                                                                    <LinkBox cursor="pointer" onClick={onClose} py="1">
                                                                        <Text fontSize="xl">{child.title[lang]}</Text>
                                                                    </LinkBox>
                                                                </NextLink>
                                                            );
                                                        })}
                                                    </Flex>
                                                </AccordionPanel>
                                            </AccordionItem>
                                        );
                                    })}
                                    <AccordionItem>
                                        <AccordionButton
                                            onClick={() => {
                                                if (status === 'authenticated') {
                                                    router.push('/profile');
                                                } else {
                                                    signIn('feide');
                                                }
                                            }}
                                        >
                                            <Text fontSize="2xl">
                                                {status === 'authenticated'
                                                    ? isNorwegian
                                                        ? 'Min profil'
                                                        : 'My profile'
                                                    : isNorwegian
                                                    ? 'Logg inn'
                                                    : 'Log in'}
                                            </Text>
                                        </AccordionButton>
                                    </AccordionItem>
                                </Accordion>
                            </Box>
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        </>
    );
};

const ProfileButton = () => {
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
    );
};
