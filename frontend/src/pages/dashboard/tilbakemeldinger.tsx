import {
    Heading,
    Text,
    SimpleGrid,
    GridItem,
    Divider,
    Center,
    Spinner,
    useToast,
    Flex,
    Spacer,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Section from '@components/section';
import SEO from '@components/seo';
import type { Feedback } from '@api/feedback';
import { FeedbackAPI } from '@api/feedback';
import { type ErrorMessage, isErrorMessage } from '@utils/error';
import FeedbackEntry from '@components/feedback-entry';
import useAuth from '@hooks/use-auth';
import ButtonLink from '@components/button-link';

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState<Array<Feedback>>();
    const [error, setError] = useState<ErrorMessage | null>();
    const [loading, setLoading] = useState<boolean>(true);

    const toast = useToast();

    const gridColumns = [1, null, null, null, 2];

    const { signedIn, idToken } = useAuth();

    useEffect(() => {
        const getFeedbacks = async () => {
            setError(null);

            if (!signedIn || !idToken) {
                setLoading(false);
                setError({ message: 'Du må være logget inn for å se denne siden.' });
                return;
            }

            const result = await FeedbackAPI.getFeedback(idToken);

            if (isErrorMessage(result)) {
                setError(result);
            } else {
                setFeedbacks(result.sort((a, b) => (new Date(a.sentAt) > new Date(b.sentAt) ? -1 : 1)));
            }

            setLoading(false);
        };

        void getFeedbacks();
    }, [idToken, signedIn]);

    const handleDelete = async (id: number) => {
        if (!signedIn || !idToken) {
            toast({
                title: 'Kunne ikke slette tilbakemelding',
                description: 'Du må være logget inn for å slette en tilbakemelding.',
                status: 'error',
                duration: 5000,
            });
            return;
        }

        await FeedbackAPI.deleteFeedback(id, idToken);

        toast({
            title: 'Tilbakemeldingen ble slettet!',
            status: 'success',
            duration: 2000,
            isClosable: true,
        });

        setFeedbacks(feedbacks?.filter((feedback) => feedback.id !== id));
    };

    const handleUpdate = async (feedback: Feedback) => {
        if (!signedIn || !idToken) {
            toast({
                title: 'Kunne ikke markere tilbakemelding som lest',
                description: 'Du må være logget inn for å markere en tilbakemelding som lest.',
                status: 'error',
                duration: 5000,
            });
            return;
        }

        await FeedbackAPI.updateFeedback(feedback, idToken);

        toast({
            title: feedback.isRead ? 'Markert som lest' : 'Markert som ulest',
            description: feedback.isRead
                ? 'Tilbakemeldingen er nå markert som lest'
                : 'Tilbakemeldingen er nå markert som ulest',
            status: 'success',
            duration: 2000,
            isClosable: true,
        });

        setFeedbacks(feedbacks?.map((f) => (f.id === feedback.id ? feedback : f)));
    };

    return (
        <>
            <SEO title="Tilbakemeldinger" />
            <Section>
                {error && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>En feil har skjedd.</Heading>
                        <Text>{error.message}</Text>
                        <ButtonLink href="/">Tilbake til forsiden</ButtonLink>
                    </Center>
                )}
                {loading && (
                    <Center flexDirection="column" gap="5" py="10">
                        <Heading>Laster inn...</Heading>
                        <Spinner size="xl" mx="auto" />
                    </Center>
                )}
                {feedbacks && (
                    <>
                        <Flex>
                            <Heading mb="5">Tilbakemeldinger</Heading>
                            <Spacer />
                            <ButtonLink href="/dashboard">Tilbake</ButtonLink>
                        </Flex>

                        {feedbacks.length > 0 && (
                            <Text fontWeight="bold">Antall tilbakemeldinger: {feedbacks.length}</Text>
                        )}
                        <Divider my="2" />
                        <SimpleGrid columns={gridColumns} gap="3">
                            {feedbacks.length > 0 ? (
                                feedbacks.map((feedback) => {
                                    return (
                                        <FeedbackEntry
                                            key={feedback.id}
                                            feedback={feedback}
                                            handleUpdate={handleUpdate}
                                            handleDelete={handleDelete}
                                        />
                                    );
                                })
                            ) : (
                                <GridItem colSpan={gridColumns}>
                                    <Center py="10">
                                        <Text fontSize="3xl">Det er ingen tilbakemeldinger ;(</Text>
                                    </Center>
                                </GridItem>
                            )}
                        </SimpleGrid>
                    </>
                )}
            </Section>
        </>
    );
};

export default FeedbackPage;
