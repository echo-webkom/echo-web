import { Heading, Text } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import Layout from '../../components/layout';
import { BedpresAPI } from '../../lib/api';
import { Bedpres } from '../../lib/types';
import MapMarkdownChakra from '../../markdown';

const BedpresPage = ({ bedpres, error }: { bedpres: Bedpres; error: string }): JSX.Element => {
    const router = useRouter();

    return (
        <Layout>
            {router.isFallback && <Text>Loading...</Text>}
            {!router.isFallback && !bedpres && <Text>Bedpres not found</Text>}
            {error && !router.isFallback && <Text>{error}</Text>}
            {bedpres && !router.isFallback && !error && (
                <>
                    <Heading>{bedpres.title}</Heading>
                    <Markdown options={MapMarkdownChakra}>{bedpres.body}</Markdown>
                </>
            )}
        </Layout>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = await BedpresAPI.getPaths();
    return {
        paths: paths.map((slug: string) => ({
            params: {
                slug,
            },
        })),
        fallback: true,
    };
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
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
