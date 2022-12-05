import type { ParsedUrlQuery } from 'querystring';
import type { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';

interface Props {
    slug: string;
}

const WaitingListSlugPage = ({ slug }: Props) => {
    const [output, setOutput] = useState('');

    useEffect(() => {
        setOutput('Connecting to the server');
        fetch('/api/WaitingList/' + slug)
            .then((result) => {
                setOutput(result.status.toString());
            })
            .catch(() => setOutput('request could not be fullfilled'));
    }, []);
    return <div>{output}</div>;
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as Params;

    return {
        props: {
            slug: slug,
        },
    };
};

export default WaitingListSlugPage;
