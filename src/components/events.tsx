import React, { useState } from 'react';
import Calendar from 'react-calendar';
import {
    Box,
    Button,
    SimpleGrid,
    Menu,
    MenuItem,
    MenuButton,
    MenuList,
    Center,
    Text,
    Flex,
    Image,
    Divider,
    HStack,
    Heading,
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import ContentBox from './content-box';

const logo = '/consulting.png';

enum ViewOptions {
    ViewList,
    ViewCalendar,
}

interface EventData {
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
}

const Event = ({ imageSrc, imageAlt, title, description }: EventData): JSX.Element => {
    return (
        <Flex justifyContent="center" align="center">
            <HStack>
                <SimpleGrid rows={2}>
                    <Text fontSize="3xl">{title}</Text>
                    <Text fontSize="m">{description}</Text>
                </SimpleGrid>
                <Image htmlWidth="200px" src={imageSrc} alt={imageAlt} />
            </HStack>
        </Flex>
    );
};

const Events = (): JSX.Element => {
    const [viewOption, changeView] = useState(ViewOptions.ViewList);

    return (
        <ContentBox data-testid="events">
            <Heading>Bedriftspresentasjoner</Heading>
            <Divider my="2" />
            {viewOption === ViewOptions.ViewList ? (
                <Box>
                    <SimpleGrid spacing={5}>
                        <Event
                            imageSrc={logo}
                            imageAlt="logo"
                            title="Generisk Konsulentselskap"
                            description="Generisk Konsulentselskap inviterer til bedriftspresentasjon! De er et firma som driver med verdiskapning i den offentlige sektoren, og videreutvikling av sammsunnsviktige IT-løsninger ved hjelp av DevOps og en agil prosjektmetodikk."
                        />
                        <Divider />
                        <Event
                            imageSrc={logo}
                            imageAlt="logo"
                            title="Generisk Konsulentselskap"
                            description="Generisk Konsulentselskap inviterer til bedriftspresentasjon! De er et firma som driver med verdiskapning i den offentlige sektoren, og videreutvikling av sammsunnsviktige IT-løsninger ved hjelp av DevOps og en agil prosjektmetodikk."
                        />
                        <Divider />
                        <Event
                            imageSrc={logo}
                            imageAlt="logo"
                            title="Generisk Konsulentselskap"
                            description="Generisk Konsulentselskap inviterer til bedriftspresentasjon! De er et firma som driver med verdiskapning i den offentlige sektoren, og videreutvikling av sammsunnsviktige IT-løsninger ved hjelp av DevOps og en agil prosjektmetodikk."
                        />
                    </SimpleGrid>
                </Box>
            ) : (
                <Center>
                    <Calendar />
                </Center>
            )}
            <Center>
                <Menu autoSelect={false}>
                    <MenuButton as={Button} rightIcon={<FaChevronDown />}>
                        Visning
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => changeView(ViewOptions.ViewList)}>Liste</MenuItem>
                        <MenuItem onClick={() => changeView(ViewOptions.ViewCalendar)}>Kalender</MenuItem>
                    </MenuList>
                </Menu>
            </Center>
        </ContentBox>
    );
};

export default Events;
