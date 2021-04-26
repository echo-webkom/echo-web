import React from 'react';
import { GetStaticProps } from 'next';
import { Center, Text, SimpleGrid, Stack, StackDivider, Heading } from '@chakra-ui/react';
import isBefore from 'date-fns/isBefore';
import { BedpresAPI, Bedpres } from '../../lib/api/bedpres';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import BedpresPreview from '../../components/bedpres-preview';
import ContentBox from '../../components/content-box';
import ErrorBox from '../../components/error-box';

const BedpresCollectionPage = ({ bedpreses, error }: { bedpreses: Array<Bedpres>; error: string }): JSX.Element => {
    const upcoming = bedpreses.filter((bedpres: Bedpres) => {
        return isBefore(new Date(), new Date(bedpres.date));
    });

    const previous = bedpreses.filter((bedpres: Bedpres) => {
        return isBefore(new Date(bedpres.date), new Date());
    });

    return (
        <Layout>
            <SEO title="Bedriftspresentasjoner" />
            {error && <ErrorBox error={error} />}
            {!error && (
                <SimpleGrid columns={[1, null, null, 2]} spacing="5">
                    <ContentBox>
                        <Heading>Kommende</Heading>
                        {upcoming.length === 0 && (
                            <Center mt="3em">
                                <Text fontSize="xl">Ingen kommende bedriftspresentasjoner :(</Text>
                            </Center>
                        )}
                        {upcoming.length !== 0 && (
                            <Stack spacing={5} divider={<StackDivider />}>
                                {upcoming.map((bedpres: Bedpres) => {
                                    return (
                                        <BedpresPreview key={bedpres.slug} bedpres={bedpres} testid={bedpres.slug} />
                                    );
                                })}
                            </Stack>
                        )}
                    </ContentBox>
                    <ContentBox>
                        <Heading>Tidligere</Heading>
                        {previous.length === 0 && (
                            <Center mt="3em">
                                <Text fontSize="xl">Ingen tidligere bedriftspresentasjoner</Text>
                            </Center>
                        )}
                        {previous && (
                            <Stack spacing={5} divider={<StackDivider />}>
                                {previous.map((bedpres: Bedpres) => {
                                    return (
                                        <BedpresPreview key={bedpres.slug} bedpres={bedpres} testid={bedpres.slug} />
                                    );
                                })}
                            </Stack>
                        )}
                    </ContentBox>
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
