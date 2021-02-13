import React, { useState } from 'react';
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
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, add, getDate } from 'date-fns';

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

interface WeeksWithDays {
    week1: Array<Date>;
    week2: Array<Date>;
    week3: Array<Date>;
    week4: Array<Date>;
    week5: Array<Date>;
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

/*
const Week = ({ days }: { days: Array<number> }): JSX.Element => {
    return (
        <Box>
            {days.map(day => <Text>{day}</Text>)}
        </Box>
    )
};
*/

const Calendar = (): JSX.Element => {
    const today: Date = new Date(Date.now());
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    const Days = (startx: Date, endx: Date): Array<Date> => {
        if (getDate(startx) === getDate(endx)) {
            return [endx];
        }
        const tempDates = Days(add(startx, { days: 1 }), endx);
        tempDates.push(startx);
        return tempDates;
    };
    const dates = Days(start, end).reverse();

    return (
        <Box>
            {dates.map((date) =>
                getDate(date) !== getDate(today) ? (
                    <Text>{date.toString()}</Text>
                ) : (
                    <Text fontSize="xl">{date.toString()}</Text>
                ),
            )}
        </Box>
    );
};

const Events = (): JSX.Element => {
    const [viewOption, changeView] = useState(ViewOptions.ViewCalendar);

    return (
        <Center>
            <Box pt="100px" w="900px" data-testid="events">
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
