//import fs from 'fs';
import { Grid, GridItem, Heading, LinkBox, LinkOverlay, useBreakpointValue, VStack } from '@chakra-ui/react';
import { isBefore, isFuture } from 'date-fns';
import { GetStaticProps } from 'next';
import NextLink from 'next/link';
import React from 'react';
import EntryBox from '../components/entry-box';
import SEO from '../components/seo';
import Section from '../components/section';
import {
    Banner,
    BannerAPI,
    Happening,
    HappeningAPI,
    HappeningType,
    isErrorMessage,
    Post,
    PostAPI,
    RegistrationAPI,
    RegistrationCount,
    JobAdvertAPI,
    JobAdvert,
} from '../lib/api';
//import getRssXML from '../lib/generate-rss-feed';

const IndexPage = ({
    bedpreses,
    posts,
    events,
    banner,
    registrationCounts,
    jobs,
    enableJobAdverts,
}: {
    bedpreses: Array<Happening>;
    posts: Array<Post>;
    events: Array<Happening>;
    banner: Banner | null;
    registrationCounts: Array<RegistrationCount>;
    jobs: Array<JobAdvert>;
    enableJobAdverts: boolean;
}): JSX.Element => {
    const BannerComponent = ({ banner }: { banner: Banner }) => {
        const headingSize = useBreakpointValue(['md', 'md', 'lg', 'lg']);

        return (
            <Section
                bg={banner.color}
                px="2rem"
                mx={['0rem', null, null, '3rem']}
                my={['1rem', null, '2rem', '2.5rem']}
            >
                <Heading textAlign="center" size={headingSize} color="white">
                    {banner.text}
                </Heading>
            </Section>
        );
    };

    const PostEntryBox = () => (
        <EntryBox
            titles={['Innlegg']}
            entries={posts}
            entryLimit={useBreakpointValue([3, 3, 3, 2, 2, 3, 4])}
            altText="Ingen innlegg :("
            linkTo="/posts"
            type="post"
            enableJobAdverts={enableJobAdverts}
        />
    );

    return (
        <>
            <SEO title="echo – Linjeforeningen for informatikk" />
            {banner &&
                (banner.linkTo ? (
                    <LinkBox transition="0.3s ease" _hover={{ transform: 'scale(105%)' }}>
                        <NextLink href={banner.linkTo} passHref>
                            <LinkOverlay isExternal={banner.isExternal}>
                                <BannerComponent banner={banner} />
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                ) : (
                    <BannerComponent banner={banner} />
                ))}
            <VStack spacing="5" mb="5">
                <Grid w="100%" gap={5} templateColumns={['1', null, null, 'repeat(2, 1fr)']}>
                    <GridItem>
                        <EntryBox
                            title="Arrangementer"
                            entries={events}
                            altText="Ingen kommende arrangementer :("
                            linkTo="/happenings-overview"
                            type="event"
                            registrationCounts={registrationCounts}
                        />
                    </GridItem>
                    <GridItem>
                        <EntryBox
                            titles={['Bedpres', 'Bedpresolini', 'Bedriftspresentasjoner']}
                            entries={bedpreses}
                            altText="Ingen kommende bedriftspresentasjoner :("
                            linkTo="/happenings-overview"
                            type="bedpres"
                            registrationCounts={registrationCounts}
                        />
                    </GridItem>
                </Grid>
                {enableJobAdverts ? (
                    <Grid w="100%" gap={5} templateColumns={['1', null, null, 'repeat(2, 1fr)']}>
                        <GridItem>
                            <EntryBox
                                titles={['Jobb', 'Annonser', 'Jobbannonser', 'Stillingsannonser']}
                                entries={jobs}
                                altText="Ingen stillingsannonser :("
                                linkTo="/job"
                                type="job-advert"
                                enableJobAdverts={enableJobAdverts}
                            />
                        </GridItem>
                        <GridItem>
                            <PostEntryBox />
                        </GridItem>
                    </Grid>
                ) : (
                    <PostEntryBox />
                )}
            </VStack>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const [bedpresesResponse, eventsResponse, postsResponse, jobsResponse, bannerResponse] = await Promise.all([
        HappeningAPI.getHappeningsByType(0, HappeningType.BEDPRES),
        HappeningAPI.getHappeningsByType(0, HappeningType.EVENT),
        PostAPI.getPosts(0),
        JobAdvertAPI.getJobAdverts(3),
        BannerAPI.getBanner(),
    ]);

    if (isErrorMessage(bedpresesResponse)) throw new Error(bedpresesResponse.message);
    if (isErrorMessage(eventsResponse)) throw new Error(eventsResponse.message);
    if (isErrorMessage(postsResponse)) throw new Error(postsResponse.message);
    if (bannerResponse && isErrorMessage(bannerResponse)) throw new Error(bannerResponse.message);
    if (isErrorMessage(jobsResponse)) throw new Error(jobsResponse.message);

    //const rss = getRssXML(postsResponse, [...eventsResponse, ...bedpresesResponse]);

    //fs.writeFileSync('./public/rss.xml', rss);

    const events = eventsResponse.filter((event: Happening) => isFuture(new Date(event.date))).slice(0, 8);
    const [bedpresLimit, eventLimit] = events.length > 3 ? [4, 8] : [2, 4];

    const bedpreses = bedpresesResponse
        .filter((bedpres: Happening) => {
            return isBefore(new Date().setHours(0, 0, 0, 0), new Date(bedpres.date));
        })
        .slice(0, bedpresLimit);

    const slugs = [...bedpreses, ...events].map((happening: Happening) => happening.slug);
    const registrationCountsResponse = await RegistrationAPI.getRegistrationCountForSlugs(
        slugs,
        process.env.BACKEND_URL ?? 'http://localhost:8080',
    );

    const enableJobAdverts = process.env.ENABLE_JOB_ADVERTS?.toLowerCase() === 'true';

    return {
        props: {
            bedpreses,
            posts: postsResponse.slice(0, process.env.ENABLE_JOB_ADVERTS?.toLowerCase() === 'true' ? 2 : 3),
            events: events.slice(0, eventLimit),
            jobs: jobsResponse,
            banner: bannerResponse ?? null,
            registrationCounts: isErrorMessage(registrationCountsResponse) ? [] : registrationCountsResponse,
            enableJobAdverts,
        },
        revalidate: 60,
    };
};

export default IndexPage;
