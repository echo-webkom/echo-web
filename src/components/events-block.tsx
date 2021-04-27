import {
    Button,
    Center,
    Divider,
    Flex,
    Heading,
    Icon,
    LinkBox,
    LinkOverlay,
    Spacer,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import format from 'date-fns/format';
import { VscTriangleRight } from 'react-icons/vsc';
import NextLink from 'next/link';
import { Event } from '../lib/api/event';

import theme from '../styles/theme';
import ContentBox from './content-box';
import ErrorBox from './error-box';
import EventPreview from './event-preview';

const EventsBlock = ({ events, error }: { events: Array<Event> | null; error: string | null }): JSX.Element => {
    return (
        <ContentBox>
            <Center wordBreak="break-word">
                <Heading mb=".5em">Arrangementer</Heading>
            </Center>
            {!events && error && <ErrorBox error={error} />}
            {events && !error && events.length === 0 && (
                <Center>
                    <Text>Ingen kommende arrangementer.</Text>
                </Center>
            )}
            {events && !error && events.length !== 0 && (
                <Stack pt=".5em" spacing="5" divider={<Divider />} fontSize={['lg', 'xl', '2xl']}>
                    {events.map((event: Event) => (
                        <EventPreview event={event} />
                    ))}
                </Stack>
            )}
            <Center>
                <LinkBox>
                    <NextLink href="/events" passHref>
                        <LinkOverlay>
                            <Button colorScheme="teal" mt="1.5rem" fontSize="xl">
                                Se mer
                            </Button>
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </Center>
        </ContentBox>
    );
};

export default EventsBlock;
