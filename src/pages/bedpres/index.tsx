import React from 'react';
import { GetStaticProps } from 'next';
import { Center, Text, SimpleGrid, Stack, StackDivider, Heading, GridItem } from '@chakra-ui/react';
import { isFuture, isPast } from 'date-fns';
import { BedpresAPI, Bedpres } from '../../lib/api/bedpres';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import BedpresPreview from '../../components/bedpres-preview';
import ContentBox from '../../components/content-box';
import ErrorBox from '../../components/error-box';

const BedpresCollectionPage = ({ bedpreses, error }: { bedpreses: Array<Bedpres>; error: string }): JSX.Element => {
    const upcoming = bedpreses.filter((bedpres: Bedpres) => {
        return isFuture(new Date(bedpres.date));
    });

    const previous = bedpreses
        .filter((bedpres: Bedpres) => {
            return isPast(new Date(bedpres.date));
        })
        .reverse();

    return (
        <Layout>
            <SEO title="Bedriftspresentasjoner" />
            {error && <ErrorBox error={error} />}
            {!error && (
                <SimpleGrid columns={[1, null, null, 2]} spacing="5">
                    <GridItem rowStart={[2, null, null, 1]}>
                        <ContentBox>
                            <Center minW="0">
                                <Heading mb="5">Tidligere</Heading>
                            </Center>
                            {previous.length === 0 && (
                                <Center mt="3em">
                                    <Text fontSize="xl">Ingen tidligere bedriftspresentasjoner</Text>
                                </Center>
                            )}
                            {previous && (
                                <Stack spacing={5} divider={<StackDivider />}>
                                    {previous.map((bedpres: Bedpres) => {
                                        return (
                                            <BedpresPreview
                                                key={bedpres.slug}
                                                bedpres={bedpres}
                                                data-testid={bedpres.slug}
                                            />
                                        );
                                    })}
                                </Stack>
                            )}
                        </ContentBox>
                    </GridItem>
                    <GridItem rowStart={1}>
                        <ContentBox>
                            <Center minW="0">
                                <Heading mb="5">Kommende</Heading>
                            </Center>
                            {upcoming.length === 0 && (
                                <Center mt="3em">
                                    <Text fontSize="xl">Ingen kommende bedriftspresentasjoner :(</Text>
                                </Center>
                            )}
                            {upcoming.length !== 0 && (
                                <Stack spacing={5} divider={<StackDivider />}>
                                    {upcoming.map((bedpres: Bedpres) => {
                                        return (
                                            <BedpresPreview
                                                key={bedpres.slug}
                                                bedpres={bedpres}
                                                data-testid={bedpres.slug}
                                            />
                                        );
                                    })}
                                </Stack>
                            )}
                        </ContentBox>
                    </GridItem>
                </SimpleGrid>
            )}
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { bedpreses, error } = await BedpresAPI.getBedpreses(0);

    if (bedpreses) {
        return {
            props: {
                bedpreses,
                error,
            },
        };
    }
    return {
        props: {
            bedpreses: [],
            error,
        },
    };
};

export default BedpresCollectionPage;
