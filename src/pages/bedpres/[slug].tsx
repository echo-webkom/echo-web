import React from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import Markdown from 'markdown-to-jsx';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';

import { CgOrganisation } from 'react-icons/cg';
import { RiTimeLine } from 'react-icons/ri';
import { MdEventSeat, MdLockOpen, MdLockOutline } from 'react-icons/md';
import { BiCalendar } from 'react-icons/bi';
import { ImLocation } from 'react-icons/im';

import { Link, Grid, Text, GridItem, Divider, Center, LinkBox, LinkOverlay, Icon, Heading } from '@chakra-ui/react';

import { Bedpres, BedpresAPI } from '../../lib/api/bedpres';
import { Registration, RegistrationAPI } from '../../lib/api/registration';
import MapMarkdownChakra from '../../markdown';
import ContentBox from '../../components/content-box';
import BedpresView from '../../components/bedpres-view';
import Layout from '../../components/layout';
import SEO from '../../components/seo';
import ErrorBox from '../../components/error-box';
import Countdown from '../../components/countdown';

const BedpresPage = ({
    bedpres,
    registrations,
    backendUrl,
    spotsTaken,
    error,
}: {
    bedpres: Bedpres;
    registrations: Array<Registration>;
    backendUrl: string;
    spotsTaken: number | null;
    error: string;
}): JSX.Element => {
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
                                {bedpres.spots != 0 && (
                                    <>
                                        <Icon as={MdEventSeat} boxSize={10} />
                                        <Text>
                                            {(spotsTaken &&
                                                `${Math.min(spotsTaken, bedpres.spots)}/${bedpres.spots}`) ||
                                                (!spotsTaken && `${bedpres.spots}`)}{' '}
                                            plasser
                                        </Text>
                                    </>
                                )}
                                <Icon as={BiCalendar} boxSize={10} />
                                <Text>{format(parseISO(bedpres.date), 'dd. MMM yyyy')}</Text>
                                <Icon as={RiTimeLine} boxSize={10} />
                                <Text>{format(parseISO(bedpres.date), 'HH:mm')}</Text>
                                <Icon as={ImLocation} boxSize={10} />
                                <Text>{bedpres.location}</Text>
                                {bedpres.minDegreeYear === 1 && bedpres.maxDegreeYear === 5 && (
                                    <>
                                        <Icon as={MdLockOpen} boxSize={10} />
                                        <Text>Åpen for alle trinn</Text>
                                    </>
                                )}
                                {bedpres.minDegreeYear &&
                                    bedpres.maxDegreeYear &&
                                    (bedpres.minDegreeYear > 1 || bedpres.maxDegreeYear < 5) && (
                                        <>
                                            <Icon as={MdLockOutline} boxSize={10} />
                                            <Text>{`Bare for ${bedpres.minDegreeYear} - ${bedpres.maxDegreeYear} .trinn`}</Text>
                                        </>
                                    )}
                            </Grid>
                            <Divider my=".5em" />
                            <Center>
                                <Text fontWeight="bold">PÅMELDING</Text>
                            </Center>
                            <Countdown bedpres={bedpres} backendUrl={backendUrl} />
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
                                <Heading mb="0.2em" size="2xl">
                                    {bedpres.title}
                                </Heading>
                                <Divider my=".5em" />
                                <Markdown options={{ overrides: MapMarkdownChakra }}>{bedpres.body}</Markdown>
                            </ContentBox>
                        </GridItem>
                    </Grid>
                    {registrations && registrations.length > 0 && (
                        <BedpresView registrations={registrations} bedpres={bedpres} />
                    )}
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
    const bedkomKey = process.env.BEDKOM_KEY;
    const showAdmin = context.query?.key === bedkomKey;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    if (showAdmin && !bedkomKey) throw Error('No BEDKOM_KEY defined.');

    const { registrations } = await RegistrationAPI.getRegistrations(bedkomKey || '', slug, backendUrl);
    const realReg = showAdmin ? registrations || [] : [];
    const spotsTaken = registrations?.length || null;

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            bedpres,
            registrations: realReg,
            spotsTaken,
            backendUrl,
            error,
        },
    };
};

export default BedpresPage;
