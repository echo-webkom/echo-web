import fs from 'fs';
import { LinkOverlay, LinkBox, Heading, Grid, GridItem, useBreakpointValue, VStack } from '@chakra-ui/react';
import { isBefore, isFuture } from 'date-fns';
import { GetStaticProps } from 'next';
import NextLink from 'next/link';
import React from 'react';
import EntryBox from '../components/entry-box';
import SEO from '../components/seo';
import Section from '../components/section';
import { BannerAPI, Banner, HappeningAPI, Happening, HappeningType, Post, PostAPI, isErrorMessage } from '../lib/api';
import getRssXML from '../lib/generate-rss-feed';

const IndexPage = ({
    bedpreses,
    posts,
    events,
    banner,
}: {
    bedpreses: Array<Happening>;
    posts: Array<Post>;
    events: Array<Happening>;
    banner: Banner | null;
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

    return (
        <>
            <SEO title="echo – Fagutvalget for informatikk" />
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
                            linkTo="/event"
                            type="event"
                        />
                    </GridItem>
                    <GridItem>
                        <EntryBox
                            titles={[
                                'Bedpres',
                                'Bedpresolini',
                                'Bedriftspresentasjoner',
                                'Bedpres',
                                'Bedriftspresentasjoner',
                            ]}
                            entries={bedpreses}
                            altText="Ingen kommende bedriftspresentasjoner :("
                            linkTo="/bedpres"
                            type="bedpres"
                        />
                    </GridItem>
                </Grid>
                <EntryBox
                    titles={['Innlegg']}
                    entries={posts}
                    entryLimit={useBreakpointValue([3, 3, 3, 2, 2, 3, 4])}
                    altText="Ingen innlegg :("
                    linkTo="/posts"
                    type="post"
                />
            </VStack>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const bedpresesResponse = await HappeningAPI.getHappeningsByType(0, HappeningType.BEDPRES);
    const eventsResponse = await HappeningAPI.getHappeningsByType(0, HappeningType.EVENT);
    const postsResponse = await PostAPI.getPosts(0);
    const bannerResponse = await BannerAPI.getBanner();

    if (isErrorMessage(bedpresesResponse)) throw new Error(bedpresesResponse.message);
    if (isErrorMessage(eventsResponse)) throw new Error(eventsResponse.message);
    if (isErrorMessage(postsResponse)) throw new Error(postsResponse.message);
    if (bannerResponse && isErrorMessage(bannerResponse)) throw new Error(bannerResponse.message);

    const rss = getRssXML(postsResponse, [...eventsResponse, ...bedpresesResponse]);

    fs.writeFileSync('./public/rss.xml', rss);

    const [bedpresLimit, eventLimit] = eventsResponse.length > 3 ? [4, 8] : [3, 4];

    return {
        props: {
            bedpreses: bedpresesResponse
                .filter((bedpres: Happening) => {
                    return isBefore(new Date().setHours(0, 0, 0, 0), new Date(bedpres.date));
                })
                .slice(0, bedpresLimit),
            posts: postsResponse.slice(0, eventLimit),
            events: eventsResponse.filter((event: Happening) => isFuture(new Date(event.date))).slice(0, 8),
            banner: bannerResponse ?? null,
        },
    };
};

export default IndexPage;
