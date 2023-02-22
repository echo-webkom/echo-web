import type { ParsedUrlQuery } from 'querystring';
import type { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { Center, Spinner, Text } from '@chakra-ui/react';
import WaitinglistAPI from '@api/waitinglist';

interface Props {
    uuid: string;
}

const WaitingListPage = ({ uuid }: Props) => {
    const [loading, setLoading] = useState(false);
    const [approved, setApproved] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const acceptSpot = async () => {
            setLoading(true);
            setError(false);
            const { statusCode } = await WaitinglistAPI.promoteUUID(uuid);
            if (statusCode === 200) {
                setApproved(true);
            } else if (statusCode === 202) {
                setApproved(false);
            } else {
                setError(true);
            }
            setLoading(false);
        };
        void acceptSpot();
    }, [uuid]);

    return (
        <Center mt="5em" alignItems="center">
            {loading && <Spinner size="xl" />}
            {error && !loading && <Text>Det har skjedd en feil, ta kontakt med Webkom.</Text>}
            {approved && !loading && !error && <Text>Du fikk plass på arrangementet!</Text>}
            {!approved && !loading && !error && <Text>Du fikk dessverre ikke plass på arrangementet.</Text>}
        </Center>
    );
};

interface Params extends ParsedUrlQuery {
    uuid: string;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { uuid } = context.params as Params;
    return {
        props: {
            uuid: uuid,
        },
    };
};

export default WaitingListPage;
