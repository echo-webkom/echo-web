import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    SimpleGrid,
    Icon,
    LinkBox,
    LinkOverlay,
} from '@chakra-ui/react';
import { google, outlook, yahoo, ics } from 'calendar-link';
import { addHours, format } from 'date-fns';
import { nb } from 'date-fns/locale';
import NextLink from 'next/link';
import { FaFileDownload, FaGoogle, FaYahoo } from 'react-icons/fa';
import { SiMicrosoftoutlook } from 'react-icons/si';
import { BiCalendar } from 'react-icons/bi';
import type { HappeningType } from '@api/happening';
import IconText from '@components/icon-text';

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
                <ModalContent mx="5">
                    <ModalHeader>
                        Legg {type === 'EVENT' ? 'arrangementet' : 'bedriftspresentasjonen'} til i kalenderen:
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <SimpleGrid columns={[1, 4]} spacing="5" textAlign="center">
                            <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                                <LinkOverlay
                                    as={NextLink}
                                    href={google(event)}
                                    aria-label="Legg til i Google kalenderen"
                                >
                                    <Icon as={FaGoogle} w={12} h={12} />
                                    <h2>Google</h2>
                                </LinkOverlay>
                            </LinkBox>
                            <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                                <LinkOverlay
                                    as={NextLink}
                                    href={outlook(event)}
                                    aria-label="Legg til i Outlook kalenderen"
                                >
                                    <Icon as={SiMicrosoftoutlook} w={12} h={12} />
                                    <h2>Outlook</h2>
                                </LinkOverlay>
                            </LinkBox>
                            <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                                <LinkOverlay
                                    as={NextLink}
                                    href={yahoo(eventPlusOneHour)}
                                    aria-label="Legg til i Yahoo kalenderen"
                                >
                                    <Icon as={FaYahoo} w={12} h={12} />
                                    <h2>Yahoo</h2>
                                </LinkOverlay>
                            </LinkBox>
                            <LinkBox transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                                <LinkOverlay as={NextLink} href={ics(event)} aria-label="Last ned .ics fil">
                                    <Icon as={FaFileDownload} w={12} h={12} />
                                    <h2>.ics fil</h2>
                                </LinkOverlay>
                            </LinkBox>
                        </SimpleGrid>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CalendarPopup;
