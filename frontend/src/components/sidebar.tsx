import {
    Stack,
    Box,
    Text,
    useColorModeValue,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Link,
    LinkBox,
    LinkOverlay,
    UnorderedList,
    ListItem,
    BoxProps,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface MenuDropdownProps {
    title: string;
    isOpen: boolean;
    children?: React.ReactNode;
}

const MenuDropdown = (props: MenuDropdownProps) => {
    return (
        <Accordion allowMultiple allowToggle defaultIndex={props.isOpen ? 0 : undefined}>
            <AccordionItem border="hidden">
                <h2>
                    <AccordionButton px={0} _hover={{ textDecoration: 'underline' }}>
                        <Box flex="1" textAlign="left" fontSize={20} fontWeight={'bold'}>
                            {props.title}
                            <AccordionIcon />
                        </Box>
                    </AccordionButton>
                </h2>
                <AccordionPanel py={'0.1em'} pl={0}>
                    <UnorderedList>{props.children}</UnorderedList>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
};

interface MenuLinkProps {
    href: string;
    isFocused: boolean;
    focusColor?: string;
    testid?: string;
    children?: React.ReactNode;
}

const MenuLink = ({ href, isFocused, focusColor, testid, children }: MenuLinkProps) => {
    return (
        <LinkBox data-testid={testid} data-cy="nav-item" py={'0.2em'}>
            <NextLink href={href} passHref>
                <LinkOverlay
                    as={Link}
                    textUnderlineOffset={'0.1em'}
                    fontSize={20}
                    textColor={isFocused ? focusColor : undefined}
                >
                    {children}
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

const Sidebar = (props: BoxProps) => {
    type MenuItem =
        | { name: string; href: string; items?: Array<MenuItem> }
        | { name: string; href?: string; items: Array<MenuItem> };

    const sidebarStruct = [
        {
            name: 'Om echo',
            items: [
                { name: 'Hvem er vi?', href: '/om-echo/om-oss' },
                { name: 'Instituttrådet', href: '/om-echo/instituttraadet' },
                { name: 'Vedtekter', href: '/om-echo/vedtekter' },
                { name: 'Møtereferat', href: '/om-echo/moetereferat' },
                { name: 'Bekk', href: '/om-echo/bekk' },
            ],
        },
        {
            name: 'For Studenter',
            items: [
                {
                    name: 'Undergrupper',
                    items: [
                        { name: 'Bedkom 👔', href: '/om-echo/studentgrupper/bedkom' },
                        { name: 'Bryggelaget 🍺', href: '/om-echo/studentgrupper/bryggelaget' },
                        { name: 'Gnist ✨', href: '/om-echo/studentgrupper/gnist' },
                        { name: 'Makerspace 🛠️', href: '/om-echo/studentgrupper/makerspace' },
                        { name: 'Tilde 🥳', href: '/om-echo/studentgrupper/tilde' },
                        { name: 'Webkom 💻', href: '/om-echo/studentgrupper/webkom' },
                    ],
                },
                {
                    name: 'Underorganisasjoner',
                    items: [
                        { name: 'programmerbar 🍸', href: '/om-echo/studentgrupper/programmerbar' },
                        { name: 'echo karriere 🤝', href: '/om-echo/studentgrupper/echo-karriere' },
                    ],
                },
                {
                    name: 'Interessegrupper',
                    items: [
                        { name: 'filmklubb 🎬', href: '/om-echo/studentgrupper/echo-filmklubb' },
                        { name: 'buldring 🧗', href: '/om-echo/studentgrupper/echo-klatring-buldring' },
                        { name: 'squash 🎾', href: '/om-echo/studentgrupper/echo-squash' },
                        { name: 'kaffeslabberas ☕', href: '/om-echo/studentgrupper/echo-kaffeslabberas' },
                    ],
                },
                { name: 'Masterinfo', href: '/om-echo/masterinfo' },
                { name: 'Økonomisk støtte', href: '/om-echo/oekonomisk-stoette' },
                { name: 'Tilbakemeldinger', href: '/om-echo/anonyme-tilbakemeldinger' },
                { name: 'Utlegg', href: '/om-echo/utlegg' },
            ],
        },
        {
            name: 'For Bedrifter',
            items: [
                { name: 'Bedriftspresentasjon', href: '/om-echo/bedriftspresentasjon' },
                { name: 'Stillingsutlysninger', href: '/om-echo/stillingsutlysninger' },
            ],
        },
    ];

    const renderMenuItem = (item: MenuItem) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { asPath } = useRouter();

        if (item.href) {
            const isFocused = item.href === asPath;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const textColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');

            return (
                <ListItem listStyleType={isFocused ? 'initial' : 'none'} color={isFocused ? textColor : undefined}>
                    <MenuLink href={item.href} isFocused={isFocused} focusColor={textColor}>
                        {item.name}
                    </MenuLink>
                </ListItem>
            );
        } else {
            const isFocused = item.items?.some((item) => item.href === asPath);

            return (
                <MenuDropdown title={item.name} isOpen={isFocused ? isFocused : false}>
                    {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        item.items?.map((item) => renderMenuItem(item))
                    }
                </MenuDropdown>
            );
        }
    };

    return (
        <>
            <Stack h={'100%'} gap={'0.5px'} {...props}>
                <aside>
                    <nav>
                        {sidebarStruct.map((entry) => (
                            <Box key={entry.name}>
                                <Text fontSize={25} fontWeight={'bold'}>
                                    {entry.name}
                                </Text>
                                <UnorderedList pl={0}>{entry.items.map((item) => renderMenuItem(item))}</UnorderedList>
                            </Box>
                        ))}
                    </nav>
                </aside>
            </Stack>
        </>
    );
};

export default Sidebar;
