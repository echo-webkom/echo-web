import React from 'react';
import { Center, GridItem, Heading, SimpleGrid, Stack, StackDivider, Text } from '@chakra-ui/react';
import { isFuture, isPast } from 'date-fns';
import { Event, EventAPI } from '../../lib/api/event';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import ErrorBox from '../../components/error-box';
import ContentBox from '../../components/content-box';
import EventPreview from '../../components/event-preview';

const EventsCollectionPage = ({ events, error }: { events: Array<Event>; error: string }): JSX.Element => {
    const upcoming = events.filter((event: Event) => {
        return isFuture(new Date(event.date));
    });

    const past = events
        .filter((event: Event) => {
            return isPast(new Date(event.date));
        })
        .reverse();

    return (
        <Layout>
            <SEO title="Arrangementer" />
            {error && <ErrorBox error={error} />}
            {!error && (
                <SimpleGrid columns={[1, null, null, 2]} spacing="5">
                    <GridItem rowStart={[2, null, null, 1]}>
                        <ContentBox>
                            <Heading mb="5">Tidligere</Heading>
                            {past.length === 0 && (
                                <Center mt="3em">
                                    <Text fontSize="xl">Ingen tidligere arrangementer :(</Text>
                                </Center>
                            )}
                            {past && (
                                <Stack spacing={5} divider={<StackDivider />}>
                                    {past.map((event: Event) => (
                                        <EventPreview event={event} />
                                    ))}
                                </Stack>
                            )}
                        </ContentBox>
                    </GridItem>
                    <GridItem rowStart={[1, null, null, 1]}>
                        <ContentBox>
                            <Heading mb="5">Kommende</Heading>
                            {upcoming.length === 0 && (
                                <Center mt="3em">
                                    <Text fontSize="xl">Ingen kommende arrangementer :(</Text>
                                </Center>
                            )}
                            {upcoming && (
                                <Stack spacing={5} divider={<StackDivider />}>
                                    {upcoming.map((event: Event) => (
                                        <EventPreview event={event} />
                                    ))}
                                </Stack>
                            )}
                        </ContentBox>
                    </GridItem>
                </SimpleGrid>
            )}
        </Layout>
    );
};

export const getStaticProps = async () => {
    const { events, error } = await EventAPI.getEvents(0);

    return {
        props: {
            events,
            error,
        },
    };
};

export default EventsCollectionPage;
