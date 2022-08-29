import { Heading, Text, SimpleGrid, GridItem, Divider, Spacer, Flex, Icon, Link } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { AiOutlineMail } from 'react-icons/ai';
// eslint-disable-next-line camelcase
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { FeedbackAPI } from '../../lib/api/feedback';
import { Feedback, isErrorMessage } from '../../lib/api/types';

interface Props {
    feedbacks: Array<Feedback>;
}

const FeedbackPage = ({ feedbacks }: Props) => {
    const gridColumns = [1, null, 2, null, 3];

    return (
        <>
            <SEO title="Tilbakemeldinger" />
            <Section>
                <Heading>Tilbakemeldinger</Heading>
                <Text fontWeight="bold" decoration="underline">
                    Antall tilbakemeldinger: {feedbacks.length}
                </Text>
                <Divider my="2" />
                <SimpleGrid columns={gridColumns}>
                    {feedbacks.length > 0 ? (
                        feedbacks.reverse().map((feedback, i) => {
                            const formattedDate = (date: Date) => {
                                const year = date.getFullYear();
                                const month = date.getMonth() + 1;
                                const day = date.getDate();
                                const hour = date.getHours();
                                const minute = date.getMinutes();

                                return `${year}-${month}-${day} ${hour}:${minute}`;
                            };

                            const name = feedback.name !== '' ? feedback.name : 'Ukjent';

                            return (
                                <Flex key={i} p={4} shadow="md" borderWidth="1px" direction="column">
                                    <Text fontWeight="bold" decoration="underline">
                                        {name}
                                    </Text>
                                    {feedback.email && (
                                        <Flex direction="row" alignItems="center" gap="2">
                                            <Icon as={AiOutlineMail} />
                                            <Link href={`mailto:${feedback.email}`}>{feedback.email}</Link>
                                        </Flex>
                                    )}
                                    <Divider my="2" />
                                    <Text>{feedback.message}</Text>
                                    <Spacer />
                                    <Text fontSize="md" mt="1">
                                        {formattedDate(new Date(feedback.sent))}
                                    </Text>
                                </Flex>
                            );
                        })
                    ) : (
                        <GridItem colSpan={gridColumns}>Ingen tilbakemeldinger</GridItem>
                    )}
                </SimpleGrid>
            </Section>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACEND_URL ?? 'http://localhost:8080';
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const session = await unstable_getServerSession(context.req, context.res, authOptions);

    if (session?.user?.email) {
        const feedbacks = await FeedbackAPI.getFeedback(backendUrl, adminKey, session.user.email);
        if (!isErrorMessage(feedbacks)) {
            return { props: { feedbacks } };
        }
    }

    return {
        redirect: {
            destination: '/profile',
            permanent: false,
        },
    };
};

export default FeedbackPage;
