import {
    Heading,
    Text,
    SimpleGrid,
    GridItem,
    Divider,
    Spacer,
    Flex,
    Icon,
    Button,
    Center,
    IconButton,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import { AiOutlineCheck, AiOutlineClose, AiOutlineDelete, AiOutlineMail } from 'react-icons/ai';
import { IoMdPerson } from 'react-icons/io';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Section from '@components/section';
import SEO from '@components/seo';
import type { Feedback } from '@api/feedback';
import { FeedbackAPI } from '@api/feedback';
import { type ErrorMessage, isErrorMessage } from '@utils/error';

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState<Array<Feedback>>();
    const [error, setError] = useState<ErrorMessage | null>();
    const [loading, setLoading] = useState<boolean>(true);

    const toast = useToast();

    const gridColumns = [1, null, null, null, 2];

    useEffect(() => {
        const getFeedbacks = async () => {
            const result = await FeedbackAPI.getFeedback();

            if (isErrorMessage(result)) {
                setError(result);
            } else {
                setFeedbacks(result.reverse());
            }

            setLoading(false);
        };

        void getFeedbacks();
    }, []);

    const handleDelete = async (id: number) => {
        await FeedbackAPI.deleteFeedback(id);

        toast({
            title: 'Tilbakemeldingen ble slettet!',
            status: 'success',
            duration: 2000,
            isClosable: true,
        });

        setFeedbacks(feedbacks?.filter((feedback) => feedback.id !== id));
    };

    const handleUpdate = async (feedback: Feedback) => {
        await FeedbackAPI.updateFeedback(feedback);

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
                        <Button>
                            <Link href="/" passHref>
                                <Text>Tilbake til forsiden</Text>
                            </Link>
                        </Button>
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
                        <Heading mb="5">Tilbakemeldinger</Heading>
                        {feedbacks.length > 0 && (
                            <Text fontWeight="bold">Antall tilbakemeldinger: {feedbacks.length}</Text>
                        )}
                        <Divider my="2" />
                        <SimpleGrid columns={gridColumns} gap="3">
                            {feedbacks.length > 0 ? (
                                feedbacks.map((feedback) => {
                                    const formattedDate = (date: Date) => {
                                        const year = date.getFullYear();
                                        const month = date.getMonth() + 1;
                                        const day = date.getDate();
                                        const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
                                        const minute =
                                            date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

                                        return `${year}-${month}-${day} ${hour}:${minute}`;
                                    };

                                    const name = feedback.name !== '' ? feedback.name : 'Ukjent';

                                    return (
                                        <Flex
                                            key={feedback.id}
                                            p={4}
                                            shadow="md"
                                            borderWidth="1px"
                                            direction="column"
                                            _hover={{ borderColor: 'gray.400' }}
                                        >
                                            <Flex gap="2">
                                                <Flex direction="row" alignItems="center" gap="2">
                                                    <Icon as={IoMdPerson} />
                                                    <Text fontWeight="bold">{name}</Text>
                                                </Flex>
                                                <Spacer />
                                                <IconButton
                                                    colorScheme={feedback.isRead ? 'green' : 'gray'}
                                                    aria-label="Marker tilbakemelding som lest/ulest"
                                                    icon={feedback.isRead ? <AiOutlineClose /> : <AiOutlineCheck />}
                                                    onClick={() =>
                                                        void handleUpdate({ ...feedback, isRead: !feedback.isRead })
                                                    }
                                                />
                                                {feedback.email && (
                                                    <Link href={`mailto:${feedback.email}`}>
                                                        <IconButton
                                                            colorScheme="blue"
                                                            aria-label="Send epost"
                                                            icon={<AiOutlineMail />}
                                                        />
                                                    </Link>
                                                )}
                                                <IconButton
                                                    colorScheme="red"
                                                    aria-label="Slett tilbakemelding"
                                                    icon={<AiOutlineDelete />}
                                                    onClick={() => void handleDelete(feedback.id)}
                                                />
                                            </Flex>
                                            <Divider my="2" />
                                            <Text>{feedback.message}</Text>
                                            <Spacer my="3" />
                                            <Flex fontFamily="mono" direction="row" gap="3" fontSize="md">
                                                <Text>ID: {feedback.id}</Text>
                                                <Divider orientation="vertical" />
                                                <Text>Dato: {formattedDate(new Date(feedback.sentAt))}</Text>
                                            </Flex>
                                        </Flex>
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
