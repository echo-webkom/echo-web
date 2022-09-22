import {
    Box,
    Text,
    Button,
    Link,
    LinkBox,
    LinkOverlay,
    useColorModeValue,
    SimpleGrid,
    chakra,
    shouldForwardProp,
    Center,
    Popover,
    useDisclosure,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
} from '@chakra-ui/react';
import LanguageContext from 'language-context';
import NextLink from 'next/link';
import { isValidMotionProp, motion } from 'framer-motion';
import { ReactNode, useContext, useState } from 'react';
import { Route, Title } from 'routes';

interface Props {
    title: string;
    to?: string;
    children?: Array<Props>;
}

const NavLink = ({ title, to, children }: Props) => {
    return (
        <LinkBox mr={['.6rem', null, null, null, '1.5rem']}>
            <NextLink href={to ?? ''} passHref>
                <LinkOverlay as={Link}>{title}</LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

interface NavLinkButtonProps {
    children: ReactNode;
    onClick: () => void;
}

export const NavLinkButton = ({ children, onClick }: NavLinkButtonProps) => (
    <Button
        fontSize="3xl"
        textAlign="left"
        fontWeight="light"
        variant="unstyled"
        _hover={{ textDecoration: 'underline' }}
        marginBottom="2rem"
        onClick={onClick}
    >
        {children}
    </Button>
);

export const DesktopNavLink = ({ title, children }: Route) => {
    const isNorwegian = useContext(LanguageContext);

    const { isOpen, onToggle, onClose } = useDisclosure();

    const bg = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    return (
        <Popover trigger="hover">
            <PopoverTrigger>
                <LinkBox _hover={{ cursor: 'pointer' }}>
                    <LinkOverlay onClick={onToggle}>{title[isNorwegian ? 'no' : 'en']}</LinkOverlay>
                </LinkBox>
            </PopoverTrigger>
            <PopoverArrow />
            <PopoverContent fontSize="lg" w={children.length > 4 ? 'md' : 'xs'} shadow="lg">
                <PopoverArrow />
                <SimpleGrid
                    columns={children.length > 4 ? 2 : 1}
                    spacing="3"
                    bg={bg}
                    p="3"
                    borderRadius="base"
                    shadow="md"
                >
                    {children?.map((child) => {
                        if (!child.path) return null;

                        return (
                            <LinkBox w="full" px="3" py="2" borderRadius="base" _hover={{ bg: '#00000033' }}>
                                <NextLink href={child.path} passHref>
                                    <LinkOverlay>{child.title[isNorwegian ? 'no' : 'en']}</LinkOverlay>
                                </NextLink>
                            </LinkBox>
                        );
                    })}
                </SimpleGrid>
            </PopoverContent>
        </Popover>
    );
};

export default NavLink;
