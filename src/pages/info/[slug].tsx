import { ParsedUrlQuery } from 'querystring';
import { Center, Spinner, Heading, Divider } from '@chakra-ui/react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import Markdown from 'markdown-to-jsx';
import SEO from '../../components/seo';
import { isErrorMessage, StaticInfoAPI, StaticInfo } from '../../lib/api';
import SidebarWrapper from '../../components/sidebar-wrapper';
import MapMarkdownChakra from '../../markdown';

interface Props {
    staticInfo: StaticInfo;
}

const StaticInfoPage = ({ staticInfo }: Props): JSX.Element => {
    const router = useRouter();

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {!router.isFallback && (
                <>
                    <SEO title={staticInfo.name} />
                    <SidebarWrapper>
                        <Heading textAlign="center" size="2xl" pb="2rem">
                            {staticInfo.name}
                        </Heading>
                        <Divider mb="1rem" />
                        <Markdown options={{ overrides: MapMarkdownChakra }}>{staticInfo.info}</Markdown>
                    </SidebarWrapper>
                </>
            )}
        </>
    );
};

const getStaticPaths: GetStaticPaths = async () => {
    const paths = await StaticInfoAPI.getPaths();

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

const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params as Params;
    const staticInfo = await StaticInfoAPI.getStaticInfoBySlug(slug);

    if (isErrorMessage(staticInfo)) {
        if (staticInfo.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(staticInfo.message);
    }

    const props: Props = {
        staticInfo,
    };

    return {
        props,
    };
};

export default StaticInfoPage;
export { getStaticPaths, getStaticProps };
