import { Heading, Box, Text } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { UserAPI } from '../../lib/api';
import { FeedbackAPI } from '../../lib/api/feedback';
import { Feedback, isErrorMessage } from '../../lib/api/types';

interface Props {
    feedbacks: Array<Feedback>;
}

const FeedbackPage = ({ feedbacks }: Props) => {
    return (
        <>
            <SEO title="Tilbakemeldinger" />
            <Section>
                <Heading>Tilbakemeldinger</Heading>
                {feedbacks.map((feedback, i) => (
                    <Box key={i} bg="lightgray" borderRadius="0.25rem">
                        <Text>Navn: {feedback.name}</Text>
                        <Text>E-post: {feedback.email}</Text>
                        <Text>Tilbakemelding:{feedback.message}</Text>
                    </Box>
                ))}
            </Section>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACEND_URL ?? 'http://localhost:8080';
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const user = await UserAPI.getUser();

    if (user && !isErrorMessage(user)) {
        const feedbacks = await FeedbackAPI.getFeedback(backendUrl, adminKey, user.email);

        if (!isErrorMessage(feedbacks)) {
            return {
                props: {
                    feedbacks,
                },
            };
        }
    }

    return {
        props: {
            redirect: {
                destination: '/',
                permanent: false,
            },
        },
    };
};

export default FeedbackPage;
