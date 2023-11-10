import { Center, Spinner } from '@chakra-ui/react';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import SidebarWrapper from '@components/sidebar-wrapper';
import SEO from '@components/seo';
import MinuteList from '@components/minute-list';
import type { Minute } from '@api/minute';
import { MinuteAPI } from '@api/minute';
import { isErrorMessage } from '@utils/error';

interface Props {
    minutes: Array<Minute>;
}

const MinutesPage = ({ minutes }: Props) => {
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
                    <SEO title="minutes" />
                    <SidebarWrapper>
                        <MinuteList key="minutes" minutes={minutes} />
                    </SidebarWrapper>
                </>
            )}
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const minutes = await MinuteAPI.getMinutes();

    if (isErrorMessage(minutes)) throw new Error(minutes.message);

    return {
        props: { minutes },
    };
};

export default MinutesPage;
