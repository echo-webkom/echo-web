import {
    Box,
    Text,
    useColorModeValue,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    UnorderedList,
    ListItem,
    Flex,
    Link,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { MenuItem, sidebarRoutes } from 'lib/routes';

interface MenuDropdownProps {
    title: string;
    isOpen: boolean;
    children?: React.ReactNode;
}

const MenuDropdown = ({ title, isOpen, children }: MenuDropdownProps) => {
    return (
        <Accordion allowToggle defaultIndex={isOpen ? 0 : undefined}>
            <AccordionItem border="hidden">
                <h2>
                    <AccordionButton px={0} _hover={{ textDecoration: 'underline' }}>
                        <Box flex="1" textAlign="left" fontSize={20} fontWeight="bold">
                            {title}
                            <AccordionIcon />
                        </Box>
                    </AccordionButton>
                </h2>
                <AccordionPanel py="0.1em" pl={0}>
                    <UnorderedList>{children}</UnorderedList>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

interface MenuLinkProps {
    href: string;
    isFocused: boolean;
    onClick?: () => void;
    focusColor?: string;
    testid?: string;
    children?: React.ReactNode;
}

const MenuLink = ({ href, isFocused, onClick, focusColor, testid, children }: MenuLinkProps) => {
    return (
        <Link as={NextLink} href={href}>
            <Box
                data-testid={testid}
                onClick={onClick}
                data-cy="nav-item"
                py="0.2em"
                textUnderlineOffset="0.1em"
                fontSize={20}
                textColor={isFocused ? focusColor : undefined}
            >
                {children}
            </Box>
        </Link>
    );
};

const Sidebar = ({ onClick }: { onClick?: () => void }) => {
    return (
        <Box as="aside" h="100%">
            <nav>
                {sidebarRoutes.map((item) => (
                    <Box key={item.name}>
                        <Text fontSize={25} fontWeight="bold">
                            {item.name}
                        </Text>
                        <UnorderedList pl={0}>
                            {item.items.map((item) => (
                                <MenuItem key={item.name} item={item} onClick={onClick} />
                            ))}
                        </UnorderedList>
                    </Box>
                ))}
            </nav>
        </Box>
    );
};

interface MenuItemProps {
    item: MenuItem;
    onClick?: () => void;
}

const MenuItem = ({ item, onClick }: MenuItemProps) => {
    const { asPath } = useRouter();
    const textColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');

    if ('href' in item) {
        const isFocused = item.href === asPath;

        return (
            <ListItem listStyleType={isFocused ? 'initial' : 'none'} color={isFocused ? textColor : undefined}>
                <Flex>
                    <MenuLink href={item.href} onClick={onClick} isFocused={isFocused} focusColor={textColor}>
                        {item.name}
                    </MenuLink>
                </Flex>
            </ListItem>
        );
    }

    const childHasFocus = item.items.some((child) => 'href' in child && child.href === asPath);

    return (
        <MenuDropdown title={item.name} isOpen={childHasFocus}>
            {item.items.map((item) => (
                <MenuItem key={item.name} item={item} onClick={onClick} />
            ))}
        </MenuDropdown>
    );
};

export default Sidebar;
