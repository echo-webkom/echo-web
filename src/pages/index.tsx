import React from 'react';
import { GetStaticProps } from 'next';

import { SimpleGrid, Stack, Img, Heading, Divider, Text, useColorModeValue } from '@chakra-ui/react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import BedpresBlock from '../components/bedpres-block';
import PostBlock from '../components/post-block';
import { Bedpres, Post } from '../lib/types';
import { PostAPI, BedpresAPI } from '../lib/api';
import ContentBox from '../components/content-box';

const bekkLogo = '/bekk.png';

const IndexPage = ({
    bedpreses,
    bedpresError,
    posts,
    postsError,
}: {
    bedpreses: Array<Bedpres>;
    bedpresError: string;
    posts: Array<Post>;
    postsError: string;
}): JSX.Element => {
    const bekkLogoFilter = useColorModeValue('invert(1)', 'invert(0)');

    return (
        <Layout>
            <SEO title="Home" />
            <SimpleGrid columns={[null, 1, null, 2]} spacing="5" mb="5">
                <Stack minW="0" spacing="5">
                    <ContentBox>
                        <Heading sizes={['xs', 'md']}>Hovedsamarbeidspartner</Heading>
                        <Divider mb="1em" />
                        <Img src={bekkLogo} filter={bekkLogoFilter} htmlWidth="300px" />
                    </ContentBox>
                    <ContentBox>
                        <Heading>Arrangementer</Heading>
                        <Divider mb="3" />
                        <Text>Kommer snart!</Text>
                    </ContentBox>
                </Stack>
                <BedpresBlock bedpreses={bedpreses} error={bedpresError} />
            </SimpleGrid>
            <PostBlock posts={posts} error={postsError} />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const bedpresesResponse = await BedpresAPI.getBedpreses(3);
    const postsResponse = await PostAPI.getPosts(2);

    return {
        props: {
            bedpreses: bedpresesResponse.bedpreses,
            bedpresError: bedpresesResponse.error,
            posts: postsResponse.posts,
            postsError: postsResponse.error,
        },
    };
};

export default IndexPage;
