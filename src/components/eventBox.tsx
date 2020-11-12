import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Box, Button, SimpleGrid, Menu, MenuItem, MenuButton, MenuList, Center, Text } from '@chakra-ui/core';
import { FaChevronDown } from 'react-icons/fa';

import Event from './event';
import logo from '../assets/consulting.jpg';

enum ViewOptions {
    ViewList,
    ViewCalendar,
}

const showStuff = (viewOption: ViewOptions): JSX.Element => {
    const list = (
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
    );

    const cal = (
        <Center>
            <Calendar />
        </Center>
    );

    if (viewOption === ViewOptions.ViewList) return list;

    return cal;
};

const EventBox = (): JSX.Element => {
    const [viewOption, changeView] = useState(ViewOptions.List);

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
                            <MenuItem onClick={() => changeView(ViewOptions.Calendar)}>Kalender</MenuItem>
                        </MenuList>
                    </Menu>
                </Center>
                {showStuff(viewOption)}
            </Box>
        </Center>
    );
};

export default EventBox;
