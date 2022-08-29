import { Heading, Box, Text, SimpleGrid, GridItem, Divider, Center } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { UserAPI } from '../../lib/api';
import { FeedbackAPI } from '../../lib/api/feedback';
import { ErrorMessage, Feedback, isErrorMessage, UserWithName } from '../../lib/api/types';

interface Props {
    backendUrl: string;
    adminKey: string;
}

const FeedbackPage = ({ backendUrl, adminKey }: Props) => {
    const [feedbacks, setFeedbacks] = useState<Array<Feedback>>([]);
    const [user, setUser] = useState<UserWithName | null>();
    const [error, setError] = useState<ErrorMessage | null>(null);
    const gridColumns = [1, null, 2, null, 3];

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const feedbacks = await FeedbackAPI.getFeedback(backendUrl, adminKey, user.email);
            if (isErrorMessage(feedbacks)) {
                setError(feedbacks);
            } else {
                setFeedbacks(feedbacks);
            }
        };
        if (user) void fetchFeedbacks();
    }, [backendUrl, adminKey, user]);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await UserAPI.getUser();
            if (isErrorMessage(user)) {
                setError(user);
            } else {
                setUser(user);
            }
        };
        void fetchUser();
    });

    return (
        <>
            <SEO title="Tilbakemeldinger" />
            <Section>
                {error && (
                    <Center>
                        <Heading>{error.message}</Heading>
                    </Center>
                )}
                {!error && (
                    <>
                        <Heading>Tilbakemeldinger</Heading>
                        <Text fontWeight="bold" decoration="underline">
                            Antall tilbakemeldinger: {feedbacks.length}
                        </Text>
                        <Divider my="2" />
                        <SimpleGrid columns={gridColumns}>
                            {feedbacks.length > 0 ? (
                                feedbacks.map((feedback, i) => {
                                    const formattedDate = (date: Date) => {
                                        const year = date.getFullYear();
                                        const month = date.getMonth() + 1;
                                        const day = date.getDate();
                                        const hour = date.getHours();
                                        const minute = date.getMinutes();

                                        return `${day}-${month}-${year} ${hour}:${minute}`;
                                    };

                                    return (
                                        <Box key={i} p={4} shadow="md" borderWidth="1px">
                                            <Text fontWeight="bold" decoration="underline">
                                                {feedback.name ?? 'Anonym'}
                                            </Text>
                                            <Text>{feedback.email ?? 'Anonym'}</Text>
                                            <Text>{feedback.message}</Text>
                                            <Text>{formattedDate(new Date(feedback.sent))}</Text>
                                        </Box>
                                    );
                                })
                            ) : (
                                <GridItem colSpan={gridColumns}>Ingen tilbakemeldinger</GridItem>
                            )}
                        </SimpleGrid>
                    </>
                )}
            </Section>
        </>
    );
};

export const getServerSideProps = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACEND_URL ?? 'http://localhost:8080';
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    return {
        props: {
            backendUrl,
            adminKey,
        },
    };
};

export default FeedbackPage;
