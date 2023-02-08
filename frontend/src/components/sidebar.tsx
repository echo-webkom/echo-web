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
    UnorderedList,
    ListItem,
    Flex,
    Link,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

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
                    name: 'Hovedstyret',
                    items: [
                        { name: '2022-2023', href: '/om-echo/studentgrupper/2022-2023' },
                        { name: '2021-2022', href: '/om-echo/studentgrupper/2021-2022' },
                        { name: '2020-2021', href: '/om-echo/studentgrupper/2020-2021' },
                        { name: '2019-2020', href: '/om-echo/studentgrupper/2019-2020' },
                        { name: '2018-2019', href: '/om-echo/studentgrupper/2018-2019' },
                    ],
                },
                {
                    name: 'Undergrupper',
                    items: [
                        { name: 'Bedkom 👔', href: '/om-echo/studentgrupper/bedkom' },
                        { name: 'Gnist ✨', href: '/om-echo/studentgrupper/gnist' },
                        { name: 'Makerspace 🛠️', href: '/om-echo/studentgrupper/makerspace' },
                        { name: 'Tilde 🥳', href: '/om-echo/studentgrupper/tilde' },
                        { name: 'Webkom 💻', href: '/om-echo/studentgrupper/webkom' },
                        { name: 'Hyggkom 🫶', href: '/om-echo/studentgrupper/hyggkom' },
                        { name: 'ESC 🏟️', href: '/om-echo/studentgrupper/esc' },
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
                        { name: 'bryggelaget 🍺', href: '/om-echo/studentgrupper/bryggelaget' },
                        { name: 'echo Mages 🪷', href: '/om-echo/studentgrupper/echo-mages' },
                        { name: 'echo Brettspill 🎲', href: '/om-echo/studentgrupper/echo-brettspill' },
                    ],
                },
                { name: 'Masterinfo', href: '/om-echo/masterinfo' },
                { name: 'Økonomisk støtte', href: '/om-echo/oekonomisk-stoette' },
                { name: 'Tilbakemeldinger', href: '/om-echo/anonyme-tilbakemeldinger' },
                { name: 'Utlegg', href: '/om-echo/utlegg' },
                { name: 'Si ifra', href: '/om-echo/si-ifra' },
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

    const renderMenuItem = (item: MenuItem, onClick?: () => void) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { asPath } = useRouter();

        if (item.href) {
            const isFocused = item.href === asPath;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const textColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');

            return (
                <ListItem listStyleType={isFocused ? 'initial' : 'none'} color={isFocused ? textColor : undefined}>
                    <Flex>
                        <MenuLink href={item.href} onClick={onClick} isFocused={isFocused} focusColor={textColor}>
                            {item.name}
                        </MenuLink>
                    </Flex>
                </ListItem>
            );
        } else {
            const isFocused = item.items?.some((item) => item.href === asPath);

            return (
                <MenuDropdown title={item.name} isOpen={isFocused ?? false}>
                    {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        item.items?.map((item) => renderMenuItem(item, onClick))
                    }
                </MenuDropdown>
            );
        }
    };

    return (
        <>
            <Stack h="100%" gap="0.5px">
                <aside>
                    <nav>
                        {sidebarStruct.map((entry) => (
                            <Box key={entry.name}>
                                <Text fontSize={25} fontWeight="bold">
                                    {entry.name}
                                </Text>
                                <UnorderedList pl={0}>
                                    {entry.items.map((item) => renderMenuItem(item, onClick))}
                                </UnorderedList>
                            </Box>
                        ))}
                    </nav>
                </aside>
            </Stack>
        </>
    );
};

export default Sidebar;
