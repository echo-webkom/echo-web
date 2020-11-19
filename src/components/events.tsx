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
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';

import logo from '../assets/consulting.jpg';

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
            <SimpleGrid columns={2}>
                <SimpleGrid rows={2}>
                    <Text fontSize="3xl">{title}</Text>
                    <Text fontSize="m">{description}</Text>
                </SimpleGrid>
                <Image width="300px" src={imageSrc} alt={imageAlt} />
            </SimpleGrid>
        </Flex>
    );
};

const Events = (): JSX.Element => {
    const [viewOption, changeView] = useState(ViewOptions.ViewList);

    return (
        <Center>
            <Box pt="100px" w="900px">
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
                {viewOption === ViewOptions.ViewList ? (
                    <Box border="5px">
                        <SimpleGrid p="50px" spacing={10}>
                            <Event
                                imageSrc={logo}
                                imageAlt="logo"
                                title="Generisk Konsulentselskap"
                                description="Generisk Konsulentselskap inviterer til bedriftspresentasjon! De er et firma som driver med verdiskapning i den offentlige sektoren, og videreutvikling av sammsunnsviktige IT-løsninger ved hjelp av DevOps og en agil prosjektmetodikk."
                            />
                            <Event
                                imageSrc={logo}
                                imageAlt="logo"
                                title="Generisk Konsulentselskap"
                                description="Generisk Konsulentselskap inviterer til bedriftspresentasjon! De er et firma som driver med verdiskapning i den offentlige sektoren, og videreutvikling av sammsunnsviktige IT-løsninger ved hjelp av DevOps og en agil prosjektmetodikk."
                            />
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
            </Box>
        </Center>
    );
};

export default Events;
