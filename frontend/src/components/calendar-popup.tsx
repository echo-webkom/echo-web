import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    SimpleGrid,
    LinkBox,
    LinkOverlay,
    Icon,
} from '@chakra-ui/react';
import { google, outlook, yahoo, ics } from 'calendar-link';
import { addHours, format } from 'date-fns';
import React from 'react';
import NextLink from 'next/link';
import { FaFileDownload, FaGoogle, FaYahoo } from 'react-icons/fa';
import { SiMicrosoftoutlook } from 'react-icons/si';
import { BiCalendar } from 'react-icons/bi';
import { nb } from 'date-fns/locale';
import { HappeningType } from '../lib/api';
import IconText from './icon-text';

interface Props {
    date: Date;
    location: string;
    title: string;
    type: HappeningType;
    slug: string;
}

const CalendarPopup = ({ date, location, title, type, slug }: Props): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const event = {
        title: `${title} ${type === 'EVENT' ? 'Arrangement' : 'Bedriftspresentasjon'}`,
        description:
            `${title} ${type === 'EVENT' ? 'Arrangementet' : 'Bedriftspresentasjonen'}: ` +
            `https://echo.uib.no/${type}/${slug}`.toLowerCase(),
        start: date,
        end: addHours(date, 2),
        location: `${location}`,
    };
    //This one is needed because yahoo is off by one hour
    const eventPlusOneHour = {
        ...event,
        start: addHours(event.start, 1),
        end: addHours(event.end, 1),
    };
    return (
        <>
            <IconText
                onClick={onOpen}
                _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
                icon={BiCalendar}
                text={format(date, 'dd. MMM yyyy', { locale: nb })}
            />

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        Legg {type === 'EVENT' ? 'Arrangementet' : 'Bedriftspresentasjonen'} til i kalenderen:
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <SimpleGrid columns={4} spacing="4" textAlign="center">
                            <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                                <NextLink href={google(event)} passHref>
                                    <LinkOverlay isExternal aria-label="Legg til i Google kalenderen">
                                        <Icon as={FaGoogle} w={12} h={12} />
                                        <h2>Google</h2>
                                    </LinkOverlay>
                                </NextLink>
                            </LinkBox>
                            <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                                <NextLink href={outlook(event)} passHref>
                                    <LinkOverlay isExternal aria-label="Legg til i Outlook kalenderen">
                                        <Icon as={SiMicrosoftoutlook} w={12} h={12} />
                                        <h2>Outlook</h2>
                                    </LinkOverlay>
                                </NextLink>
                            </LinkBox>
                            <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                                <NextLink href={yahoo(eventPlusOneHour)} passHref>
                                    <LinkOverlay isExternal aria-label="Legg til i Yahoo kalenderen">
                                        <Icon as={FaYahoo} w={12} h={12} />
                                        <h2>Yahoo</h2>
                                    </LinkOverlay>
                                </NextLink>
                            </LinkBox>
                            <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                                <NextLink href={ics(event)} passHref>
                                    <LinkOverlay isExternal aria-label="Last ned .ics fil">
                                        <Icon as={FaFileDownload} w={12} h={12} />
                                        <h2>.ics fil</h2>
                                    </LinkOverlay>
                                </NextLink>
                            </LinkBox>
                        </SimpleGrid>
                    </ModalBody>

                    <ModalFooter></ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CalendarPopup;
