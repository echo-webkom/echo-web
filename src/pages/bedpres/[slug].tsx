import {
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
    LinkBox,
    LinkOverlay,
    Flex,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { format, differenceInMilliseconds, parseISO } from 'date-fns';
import Markdown from 'markdown-to-jsx';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import React, { useEffect } from 'react';
import { CgProfile, CgOrganisation } from 'react-icons/cg';
import { MdEventSeat } from 'react-icons/md';
import { BiCalendar } from 'react-icons/bi';
import { ImLocation } from 'react-icons/im';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { BedpresAPI } from '../../lib/api';
import { Bedpres } from '../../lib/types';
import MapMarkdownChakra from '../../markdown';
import ContentBox from '../../components/content-box';

const BedpresPage = ({ bedpres, error }: { bedpres: Bedpres; error: string }): JSX.Element => {
    const router = useRouter();

    const regDate: Date = parseISO(bedpres.registrationTime);
    const formattedRegDate = bedpres ? format(regDate, 'dd. MMM yyyy, HH:mm') : null;
    const time =
        !bedpres || differenceInMilliseconds(regDate, new Date()) < 0
            ? 0
            : differenceInMilliseconds(regDate, new Date());

    // typescript pls
    useEffect((): (() => void) => {
        if (time !== 0) {
            const timer = setTimeout(() => {
                router.replace(router.asPath);
            }, Math.min(time, 86400000)); // absurdly large numbers here will literally destroy page, hence 1 day in ms.
            return () => {
                clearTimeout(timer);
            };
        }
        return () => {}; // :(
    }, [time, router]);

    return (
        <Layout>
            {router.isFallback && <Text>Loading...</Text>}
            {!router.isFallback && !bedpres && <Text>Bedpres not found</Text>}
            {error && !router.isFallback && <Text>{error}</Text>}
            {bedpres && !router.isFallback && !error && (
                <>
                    <SEO title={bedpres.title} />
                    <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                        <GridItem colSpan={1} as={ContentBox}>
                            <LinkBox mb="1em">
                                <NextLink href={bedpres.companyLink} passHref>
                                    <LinkOverlay href={bedpres.companyLink} isExternal>
                                        <Img src={bedpres.logoUrl} />
                                    </LinkOverlay>
                                </NextLink>
                            </LinkBox>
                            <Grid wordBreak="break-word" templateColumns="min-content auto" gap="3" alignItems="center">
                                <CgOrganisation size="2em" />
                                <NextLink href={bedpres.companyLink} passHref>
                                    <Link href={bedpres.companyLink} isExternal>
                                        {bedpres.companyLink.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}
                                    </Link>
                                </NextLink>
                                <MdEventSeat size="2em" />
                                <Text>{bedpres.spots} plasser</Text>
                                <BiCalendar size="2em" />
                                <Text>{format(parseISO(bedpres.date), 'dd. MMM yyyy')}</Text>
                                <ImLocation size="2em" />
                                <Text>{bedpres.location}</Text>
                            </Grid>
                            <Divider my=".5em" />
                            <Center>
                                <Text fontWeight="bold">PÅMELDING</Text>
                            </Center>
                            {!bedpres.registrationLinks && (
                                <Center my="3">
                                    <Text fontSize="2xl">Åpner {formattedRegDate}</Text>
                                </Center>
                            )}
                            {bedpres.registrationLinks && (
                                <Stack>
                                    {bedpres.registrationLinks.map((regLink) => (
                                        <LinkBox key={regLink.link}>
                                            <NextLink href={regLink.link} passHref>
                                                <LinkOverlay isExternal>
                                                    <Button w="100%" colorScheme="teal">
                                                        {regLink.description}
                                                    </Button>
                                                </LinkOverlay>
                                            </NextLink>
                                        </LinkBox>
                                    ))}
                                </Stack>
                            )}
                            <Divider my=".5em" />
                            <Center>
                                <Heading size="lg">@{bedpres.author.authorName}</Heading>
                            </Center>
                        </GridItem>
                        <GridItem
                            colStart={[1, null, null, 2]}
                            rowStart={[2, null, null, 1]}
                            colSpan={[1, null, null, 3]}
                            rowSpan={2}
                        >
                            <ContentBox>
                                <Heading>{bedpres.title}</Heading>
                                <Divider my=".5em" />
                                <Markdown options={MapMarkdownChakra}>{bedpres.body}</Markdown>
                            </ContentBox>
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
