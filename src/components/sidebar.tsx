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
                { name: 'Hvem er vi?', href: '/info/om-oss' },
                { name: 'Instituttrådet', href: '/info/instituttraadet' },
                { name: 'Statutter', href: '/info/statutter' },
                { name: 'Møtereferat', href: '/info/moetereferat' },
                { name: 'Bekk', href: '/info/bekk' },
            ],
        },
        {
            name: 'For Studenter',
            items: [
                {
                    name: 'Undergrupper',
                    items: [
                        { name: 'Bedkom 👔', href: '/info/studentgrupper/bedkom' },
                        { name: 'Bryggelaget 🍺', href: '/info/studentgrupper/bryggelaget' },
                        { name: 'Gnist ✨', href: '/info/studentgrupper/gnist' },
                        { name: 'Makerspace 🛠️', href: '/info/studentgrupper/makerspace' },
                        { name: 'Tilde 🥳', href: '/info/studentgrupper/tilde' },
                        { name: 'Webkom 💻', href: '/info/studentgrupper/webkom' },
                    ],
                },
                {
                    name: 'Underorganisasjoner',
                    items: [
                        { name: 'programmerbar 🍸', href: '/info/studentgrupper/programmerbar' },
                        { name: 'echo karriere 🤝', href: '/info/studentgrupper/echo-karriere' },
                    ],
                },
                {
                    name: 'Interessegrupper',
                    items: [
                        { name: 'filmklubb 🎬', href: '/info/studentgrupper/echo-filmklubb' },
                        { name: 'buldring 🧗', href: '/info/studentgrupper/echo-klatring-buldring' },
                        { name: 'squash 🎾', href: '/info/studentgrupper/echo-squash' },
                        { name: 'kaffeslabberas ☕', href: '/info/studentgrupper/echo-kaffeslabberas' },
                    ],
                },
                { name: 'Masterinfo', href: '/info/masterinfo' },
                { name: 'Økonomisk støtte', href: '/info/oekonomisk-stoette' },
                { name: 'Tilbakemeldinger', href: '/info/anonyme-tilbakemeldinger' },
                { name: 'Utlegg', href: '/info/utlegg' },
            ],
        },
        {
            name: 'For Bedrifter',
            items: [
                { name: 'Bedriftspresentasjon', href: '/info/bedriftspresentasjon' },
                { name: 'Stillingsutlysninger', href: '/info/stillingsutlysninger' },
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
