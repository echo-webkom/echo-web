import { Spinner, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Section from '@components/section';
import { FeideGroupAPI, type FeideGroup } from '@api/feide-group';
import { type ErrorMessage, isErrorMessage } from '@utils/error';

const FeideGroupPage = () => {
    const [group, setGroup] = useState<Array<FeideGroup> | ErrorMessage>([]);
    const [loading, setLoading] = useState(true);
    const { data } = useSession();

    useEffect(() => {
        const fetchGroups = async () => {
            if (data) {
                setLoading(true);
                const response = await FeideGroupAPI.getGroups(data.accessToken);
                setLoading(false);

                setGroup(response);
            }
        };

        void fetchGroups();
    }, [data]);

    return (
        <Section>
            {isErrorMessage(group) && <Heading>Failed to load</Heading>}
            {loading && (
                <>
                    <Heading>Loading...</Heading>
                    <Spinner />
                </>
            )}

            {!isErrorMessage(group) && (
                <>
                    <Heading>Feide Groups</Heading>
                    <pre>{JSON.stringify(group, null, 2)}</pre>)
                </>
            )}
        </Section>
    );
};

export default FeideGroupPage;
