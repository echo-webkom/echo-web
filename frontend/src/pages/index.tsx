import fs from 'fs';
import {
    Center,
    Grid,
    GridItem,
    Heading,
    LinkBox,
    LinkOverlay,
    useBreakpointValue,
    VStack,
    Text,
} from '@chakra-ui/react';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { isBefore } from 'date-fns';
import type { GetStaticProps } from 'next';
import NextLink from 'next/link';
import EntryBox from '@components/entry-box';
import SEO from '@components/seo';
import Section from '@components/section';
import type { Happening } from '@api/happening';
import { HappeningAPI } from '@api/happening';
import type { Banner } from '@api/banner';
import { BannerAPI } from '@api/banner';
import type { Post } from '@api/post';
import { PostAPI } from '@api/post';
import type { RegistrationCount } from '@api/registration';
import { RegistrationAPI } from '@api/registration';
import type { JobAdvert } from '@api/job-advert';
import { JobAdvertAPI } from '@api/job-advert';
import { isErrorMessage } from '@utils/error';
import getRssXML from '@utils/generate-rss-feed';
import useLanguage from '@hooks/use-language';
import FeedbackPopup from '@components/feedback-popup';

const IndexPage = ({
    bedpreses,
    posts,
    banner,
    registrationCounts,
    jobs,
}: {
    bedpreses: Array<Happening>;
    posts: Array<Post>;
    events: Array<Happening>;
    banner: Banner | null;
    registrationCounts: Array<RegistrationCount>;
    jobs: Array<JobAdvert>;
}) => {
    const enableJobAdverts = process.env.NEXT_PUBLIC_ENABLE_JOB_ADVERTS?.toLowerCase() === 'true';
    const enableFeedbackPopup = process.env.NEXT_PUBLIC_ENABLE_FEEDBACK_POPUP?.toLowerCase() === 'true';
    const isNorwegian = useLanguage();

    const BannerComponent = ({ banner }: { banner: Banner }) => {
        const headingSize = useBreakpointValue(['md', 'md', 'lg', 'lg']);

        return (
            <Section
                bg={banner.color}
                px="2rem"
                mx={['0rem', null, null, '3rem']}
                my={['1rem', null, '2rem', '2.5rem']}
            >
                <Heading textAlign="center" size={headingSize} color={banner.textColor}>
                    {banner.text}
                </Heading>
            </Section>
        );
    };

    const PostEntryBox = () => (
        <EntryBox
            titles={isNorwegian ? ['Innlegg'] : ['Posts']}
            entries={posts}
            entryLimit={2}
            altText={isNorwegian ? 'Ingen innlegg :(' : 'No posts :('}
            linkTo="/posts"
            type="post"
        />
    );

    return (
        <>
            <SEO title="echo – Linjeforeningen for informatikk" />
            {banner &&
                (banner.linkTo ? (
                    <LinkBox transition="0.3s ease" _hover={{ transform: 'scale(105%)' }}>
                        <LinkOverlay as={NextLink} href={banner.linkTo} isExternal={banner.isExternal}>
                            <BannerComponent banner={banner} />
                        </LinkOverlay>
                    </LinkBox>
                ) : (
                    <BannerComponent banner={banner} />
                ))}
            {enableFeedbackPopup && <FeedbackPopup />}
            <VStack spacing="5" mb="5">
                <Grid w="100%" gap={5} templateColumns={['1', null, null, 'repeat(2, 1fr)']}>
                    <GridItem>
                        <VStack as={Section} spacing={10}>
                            <Center>
                                <Heading>Velkommen til echo</Heading>
                            </Center>
                            <Text>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industrys standard dummy text ever since the 1500s, when an unknown printer
                                took a galley of type and scrambled it to make a type specimen book. It has survived not
                                only five centuries, but also the leap into electronic typesetting, remaining
                                essentially unchanged. It was popularised in the 1960s with the release of Letraset
                                sheets containing Lorem Ipsum passages, and more recently with desktop publishing
                                software like Aldus PageMaker including versions of Lorem Ipsum.
                            </Text>
                        </VStack>
                    </GridItem>
                    <GridItem>
                        <EntryBox
                            titles={
                                isNorwegian
                                    ? ['Bedpres', 'Bedpresolini', 'Bedriftspresentasjoner']
                                    : ['Bedpres', 'Company presentations']
                            }
                            entries={bedpreses}
                            altText={
                                isNorwegian
                                    ? 'Ingen kommende bedriftspresentasjoner :('
                                    : 'No upcoming company presentations :('
                            }
                            linkTo="/arrangementer"
                            type="bedpres"
                            registrationCounts={registrationCounts}
                        />
                    </GridItem>
                </Grid>
                {enableJobAdverts ? (
                    <Grid w="100%" gap={5} templateColumns={['1', null, null, 'repeat(2, 1fr)']}>
                        <GridItem>
                            <EntryBox
                                titles={
                                    isNorwegian
                                        ? ['Jobb', 'Annonser', 'Jobbannonser', 'Stillingsannonser']
                                        : ['Job', 'Advertisements', 'Job advertisements']
                                }
                                entries={jobs}
                                altText={isNorwegian ? 'Ingen stillingsannonser :(' : 'No job advertisements :('}
                                linkTo="/jobb"
                                type="job-advert"
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
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const [bedpresesResponse, eventsResponse, postsResponse, jobsResponse, bannerResponse] = await Promise.all([
        HappeningAPI.getHappeningsByType(0, 'BEDPRES'),
        HappeningAPI.getHappeningsByType(0, 'EVENT'),
        PostAPI.getPosts(0),
        JobAdvertAPI.getJobAdverts(3),
        BannerAPI.getBanner(),
    ]);

    if (isErrorMessage(bedpresesResponse)) throw new Error(bedpresesResponse.message);
    if (isErrorMessage(eventsResponse)) throw new Error(eventsResponse.message);
    if (isErrorMessage(postsResponse)) throw new Error(postsResponse.message);
    if (bannerResponse && isErrorMessage(bannerResponse)) throw new Error(bannerResponse.message);
    if (isErrorMessage(jobsResponse)) throw new Error(jobsResponse.message);

    // Only run on build, not revalidate
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
        const rss = getRssXML(postsResponse, [...eventsResponse, ...bedpresesResponse]);
        fs.writeFileSync('./public/rss.xml', rss);
    }

    const events = eventsResponse
        .filter((event: Happening) => {
            return isBefore(new Date().setHours(0, 0, 0, 0), new Date(event.date));
        })
        .slice(0, 3);

    const bedpreses = bedpresesResponse
        .filter((bedpres: Happening) => {
            return isBefore(new Date().setHours(0, 0, 0, 0), new Date(bedpres.date));
        })
        .slice(0, 2);

    const slugs = [...bedpreses, ...events].map((happening: Happening) => happening.slug);
    const registrationCountsResponse = await RegistrationAPI.getRegistrationCountForSlugs(slugs, adminKey);

    return {
        props: {
            bedpreses,
            posts: postsResponse.slice(0, process.env.NEXT_PUBLIC_ENABLE_JOB_ADVERTS?.toLowerCase() === 'true' ? 2 : 3),
            events,
            jobs: jobsResponse,
            banner: bannerResponse ?? null,
            registrationCounts: isErrorMessage(registrationCountsResponse) ? [] : registrationCountsResponse,
        },
        revalidate: 60,
    };
};

export default IndexPage;
