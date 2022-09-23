import {
    LinkBox,
    LinkOverlay,
    useColorModeValue,
    SimpleGrid,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useContext } from 'react';
import LanguageContext from 'language-context';
import type { Route } from 'routes';

const DesktopNavLink = ({ title, children }: Route) => {
    const isNorwegian = useContext(LanguageContext);

    const bg = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    return (
        <Popover trigger="hover">
            <PopoverTrigger>
                <LinkBox cursor="pointer">
                    <LinkOverlay>{title[isNorwegian ? 'no' : 'en']}</LinkOverlay>
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
                    {children.map((child) => {
                        if (!child.path) return null;

                        return (
                            <LinkBox
                                key={child.title.no}
                                w="full"
                                px="3"
                                py="2"
                                borderRadius="base"
                                _hover={{ bg: '#00000033' }}
                            >
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

export default DesktopNavLink;
