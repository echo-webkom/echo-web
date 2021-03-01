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

const echoLogoDark = '/echo-logo-very-wide-text-only.png';
const echoLogoLight = '/echo-logo-very-wide-text-only-white.png';
const bekkLogo = '/bekk.png';

const IndexPage = ({ bedpreses, posts }: { bedpreses: Array<Bedpres>; posts: Array<Post> }): JSX.Element => {
    const echoLogo = useColorModeValue(echoLogoDark, echoLogoLight);
    const bekkLogoFilter = useColorModeValue('invert(1)', 'invert(0)');

    return (
        <Layout>
            <SEO title="Home" />
            <SimpleGrid columns={[1, null, 2]} spacing="5" mb="5">
                <Stack spacing="5">
                    <ContentBox>
                        <Img src={echoLogo} htmlWidth="300px" />
                    </ContentBox>
                    <ContentBox>
                        <Img src={bekkLogo} filter={bekkLogoFilter} htmlWidth="300px" />
                    </ContentBox>
                    <ContentBox>
                        <Heading>Arrangementer</Heading>
                        <Divider mb="3" />
                        <Text>Kommer snart!</Text>
                    </ContentBox>
                </Stack>
                <BedpresBlock bedpreses={bedpreses} />
            </SimpleGrid>
            <PostBlock posts={posts} />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    try {
        const { bedpreses } = await BedpresAPI.getBedpreses(3);
        const { posts } = await PostAPI.getPosts(2);

        return {
            props: {
                bedpreses,
                posts,
            },
        };
    } catch (error) {
        return {
            props: {
                posts: [],
                bedpreses: [],
            },
        };
    }
};

export default IndexPage;
