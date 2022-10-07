import type { ParsedUrlQuery } from 'querystring';
import { Center, Spinner } from '@chakra-ui/react';
import { useContext } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Markdown from 'markdown-to-jsx';
import SEO from '@components/seo';
import type { StaticInfo } from '@api/static-info';
import { StaticInfoAPI } from '@api/static-info';
import { isErrorMessage } from '@utils/error';
import SidebarWrapper from '@components/sidebar-wrapper';
import MapMarkdownChakra from '@utils/markdown';
import LanguageContext from 'language-context';

interface Props {
    staticInfo: StaticInfo;
}

const StaticInfoPage = ({ staticInfo }: Props): JSX.Element => {
    const router = useRouter();
    const isNorwegian = useContext(LanguageContext);

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {!router.isFallback && (
                <>
                    <SEO title={isNorwegian ? staticInfo.name.no : staticInfo.name.en ?? staticInfo.name.no} />
                    <SidebarWrapper>
                        <Markdown options={{ overrides: MapMarkdownChakra }}>
                            {isNorwegian ? staticInfo.info.no : staticInfo.info.en ?? staticInfo.info.no}
                        </Markdown>
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
