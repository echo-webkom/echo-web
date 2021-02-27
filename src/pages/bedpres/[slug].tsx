import {
    Box,
    Heading,
    Img,
    Link,
    Grid,
    SimpleGrid,
    Text,
    GridItem,
    Divider,
    Stack,
    Button,
    Center,
} from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import moment from 'moment';
import { CgProfile, CgOrganisation } from 'react-icons/cg';
import { MdEventSeat } from 'react-icons/md';
import { BiCalendar } from 'react-icons/bi';
import { ImLocation } from 'react-icons/im';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { BedpresAPI } from '../../lib/api';
import { Bedpres } from '../../lib/types';
import MapMarkdownChakra from '../../markdown';

const BedpresPage = ({ bedpres, error }: { bedpres: Bedpres; error: string }): JSX.Element => {
    const router = useRouter();
    const formattedRegDate = moment(bedpres.registrationTime).format('DD. MMM YYYY, HH:mm');

    return (
        <Layout>
            {router.isFallback && <Text>Loading...</Text>}
            {!router.isFallback && !bedpres && <Text>Bedpres not found</Text>}
            {error && !router.isFallback && <Text>{error}</Text>}
            {bedpres && !router.isFallback && !error && (
                <>
                    <SEO title={bedpres.title} />
                    <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                        <GridItem colSpan={1} borderWidth="1px" borderRadius="0.75em" overflow="hidden" p="2">
                            <Link href={bedpres.companyLink} isExternal>
                                <Img src={bedpres.logoUrl} />
                            </Link>
                            <SimpleGrid columns={2} alignItems="center" spacing="1">
                                <CgOrganisation size="2em" />
                                <Link href={bedpres.companyLink} isExternal>
                                    {bedpres.companyLink}
                                </Link>
                                <MdEventSeat size="2em" />
                                <Text>{bedpres.spots} plasser</Text>
                                <BiCalendar size="2em" />
                                <Text>{moment(bedpres.date).format('DD. MMM YYYY')}</Text>
                                <ImLocation size="2em" />
                                <Text>{bedpres.location}</Text>
                            </SimpleGrid>
                            <Divider my=".5em" />
                            <Text>Påmelding:</Text>
                            {!bedpres.registrationLinks && (
                                <Center my="3">
                                    <Text fontSize="1.5em">Åpner {formattedRegDate}</Text>
                                </Center>
                            )}
                            {bedpres.registrationLinks && (
                                <Stack>
                                    {bedpres.registrationLinks.map((regLink) => (
                                        <Link
                                            key={regLink.link}
                                            href={regLink.link}
                                            style={{ textDecoration: 'none' }}
                                            isExternal
                                        >
                                            <Button w="100%" colorScheme="teal">
                                                {regLink.description}
                                            </Button>
                                        </Link>
                                    ))}
                                </Stack>
                            )}
                            <Divider my=".5em" />
                            <SimpleGrid columns={2} alignItems="center">
                                <CgProfile size="2em" />
                                <Text>{bedpres.author.authorName}</Text>
                            </SimpleGrid>
                        </GridItem>
                        <GridItem
                            colStart={[1, null, null, 2]}
                            rowStart={[2, null, null, 1]}
                            colSpan={[1, null, null, 3]}
                            rowSpan={2}
                        >
                            <Box borderWidth="1px" borderRadius="0.75em" overflow="hidden" p="2">
                                <Heading>{bedpres.title}</Heading>
                                <Divider my=".5em" />
                                <Markdown options={MapMarkdownChakra}>{bedpres.body}</Markdown>
                            </Box>
                        </GridItem>
                    </Grid>
                </>
            )}
        </Layout>
    );
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as Params;
    const { bedpres, error } = await BedpresAPI.getBedpresBySlug(slug);

    return {
        props: {
            bedpres,
            error,
        },
    };
};

export default BedpresPage;
