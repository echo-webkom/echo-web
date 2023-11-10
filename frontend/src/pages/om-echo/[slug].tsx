import type { ParsedUrlQuery } from 'querystring';
import { Center, Spinner } from '@chakra-ui/react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Markdown from 'markdown-to-jsx';
import SEO from '@components/seo';
import type { StaticInfo } from '@api/static-info';
import { StaticInfoAPI } from '@api/static-info';
import { isErrorMessage } from '@utils/error';
import SidebarWrapper from '@components/sidebar-wrapper';
import MapMarkdownChakra from '@utils/markdown';

interface Props {
    staticInfo: StaticInfo;
}

const StaticInfoPage = ({ staticInfo }: Props) => {
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
export { getStaticProps, getStaticPaths };
