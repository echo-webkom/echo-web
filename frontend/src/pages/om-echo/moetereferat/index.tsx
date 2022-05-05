import { Center, Spinner } from '@chakra-ui/react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import SEO from '../../../components/seo';
import MinuteList from '../../../components/minute-list';
import { isErrorMessage, MinuteAPI, Minute } from '../../../lib/api';
import SidebarWrapper from '../../../components/sidebar-wrapper';

interface Props {
    minutes: Array<Minute>;
}

const MinutesPage = ({ minutes }: Props): JSX.Element => {
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
                    <SEO title={'minutes'} />
                    <SidebarWrapper>
                        <MinuteList key="minutes" minutes={minutes} />
                    </SidebarWrapper>
                </>
            )}
        </>
    );
};

const getStaticProps: GetStaticProps = async () => {
    const minutes = await MinuteAPI.getMinutes();

    if (isErrorMessage(minutes)) throw new Error(minutes.message);

    return {
        props: { minutes },
    };
};

export default MinutesPage;
export { getStaticProps };
