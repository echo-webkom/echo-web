import type { ParsedUrlQuery } from 'querystring';
import type { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { Center, Spinner } from '@chakra-ui/react';

interface Props {
    uuid: string;
}

const WaitingListPage = ({ uuid }: Props) => {
    const [loading, setLoading] = useState(false);
    const [approved, setApproved] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const acceptSpot = async () => {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

            setLoading(true);
            const responsePromote = await fetch(`${BACKEND_URL}/registration/promote/${uuid}`, {
                method: 'POST',
            });
            if (responsePromote.status === 202) {
                setApproved(true);
            } else if (responsePromote.ok) {
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
            {error && !loading && <div>det har skjedd en fail, snakke med webkom</div>}
            {approved && !loading && !error && <div>du fikk en plass</div>}
            {!approved && !loading && !error && <div>du fikk dessverre ikke plassen</div>}
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
