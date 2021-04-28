import React from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { format, differenceInMilliseconds, parseISO } from 'date-fns';
import Markdown from 'markdown-to-jsx';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

import { CgOrganisation } from 'react-icons/cg';
import { RiTimeLine } from 'react-icons/ri';
import { MdEventSeat } from 'react-icons/md';
import { BiCalendar } from 'react-icons/bi';
import { ImLocation } from 'react-icons/im';

import { Heading, Link, Grid, Text, GridItem, Divider, Center, LinkBox, LinkOverlay, Icon } from '@chakra-ui/react';
import useTimeout from '../../lib/hooks';
import { Bedpres, BedpresAPI } from '../../lib/api/bedpres';
import MapMarkdownChakra from '../../markdown';
import ContentBox from '../../components/content-box';
import BedpresForm from '../../components/bedpres-form';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import ErrorBox from '../../components/error-box';

const BedpresPage = ({ bedpres, error }: { bedpres: Bedpres; error: string }): JSX.Element => {
    const router = useRouter();

    const regDate = parseISO(bedpres?.registrationTime);
    const formattedRegDate = bedpres ? format(regDate, 'dd. MMM yyyy, HH:mm') : null;
    const time =
        !bedpres || differenceInMilliseconds(regDate, new Date()) < 0
            ? null
            : differenceInMilliseconds(regDate, new Date());

    useTimeout(() => {
        router.replace(router.asPath);
    }, time);

    return (
        <Layout>
            {error && !bedpres && <ErrorBox error={error} />}
            {bedpres && !error && (
                <>
                    <SEO title={bedpres.title} />
                    <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                        <GridItem colSpan={1} as={ContentBox}>
                            <LinkBox mb="1em">
                                <NextLink href={bedpres.companyLink} passHref>
                                    <LinkOverlay href={bedpres.companyLink} isExternal>
                                        <Center>
                                            <Image src={bedpres.logoUrl} alt="Bedriftslogo" width={300} height={300} />
                                        </Center>
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
                                <Icon as={MdEventSeat} boxSize={10} />
                                <Text>{bedpres.spots} plasser</Text>
                                <Icon as={BiCalendar} boxSize={10} />
                                <Text>{format(parseISO(bedpres.date), 'dd. MMM yyyy')}</Text>
                                <Icon as={RiTimeLine} boxSize={10} />
                                <Text>{format(parseISO(bedpres.date), 'HH:mm')}</Text>
                                <Icon as={ImLocation} boxSize={10} />
                                <Text>{bedpres.location}</Text>
                            </Grid>
                            <Divider my=".5em" />
                            {!bedpres.registrationLinks && (
                                <Center my="3">
                                    <Text fontSize="2xl">Åpner {formattedRegDate}</Text>
                                </Center>
                            )}
                            {bedpres.registrationLinks && <BedpresForm slug={bedpres.slug} />}
                            <Divider my=".5em" />
                            <Center>
                                <Heading size="lg">@{bedpres.author}</Heading>
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
                                <Markdown options={{ overrides: MapMarkdownChakra }}>{bedpres.body}</Markdown>
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

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            bedpres,
            error,
        },
    };
};

export default BedpresPage;
