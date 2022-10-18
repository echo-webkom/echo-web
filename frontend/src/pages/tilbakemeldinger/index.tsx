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
    Tag,
    LinkBox,
    LinkOverlay,
    Link,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
    ModalFooter,
    useDisclosure,
    ModalHeader,
    ButtonGroup,
} from '@chakra-ui/react';
import { AiOutlineCheck, AiOutlineClose, AiOutlineDelete, AiOutlineMail } from 'react-icons/ai';
import { IoMdPerson } from 'react-icons/io';
import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { MdOutlineContentCopy } from 'react-icons/md';
import { parseISO, format } from 'date-fns';
import Section from '@components/section';
import SEO from '@components/seo';
import type { Feedback } from '@api/feedback';
import { FeedbackAPI } from '@api/feedback';
import { type ErrorMessage, isErrorMessage } from '@utils/error';

const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState<Array<Feedback>>();
    const [error, setError] = useState<ErrorMessage | null>();
    const [loading, setLoading] = useState<boolean>(true);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const toast = useToast();

    const gridColumns = [1, null, null, null, 2];

    useEffect(() => {
        const getFeedbacks = async () => {
            const result = await FeedbackAPI.getFeedback();

            if (isErrorMessage(result)) {
                setError(result);
            } else {
                setFeedbacks(result.sort((a, b) => (new Date(a.sentAt) > new Date(b.sentAt) ? -1 : 1)));
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

    const copyToClipboard = async (title: string, text: string) => {
        await navigator.clipboard.writeText(text);

        toast({
            title: `${title} ble kopiert til utklippstavlen!`,
            status: 'success',
            duration: 2000,
            isClosable: true,
        });
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
                            <NextLink href="/" passHref>
                                <Link>Tilbake til forsiden</Link>
                            </NextLink>
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
                                    const formattedDate = format(parseISO(feedback.sentAt), 'yyyy-MM-dd HH:mm');

                                    const name = feedback.name !== '' ? feedback.name : 'Ukjent';

                                    return (
                                        <Flex
                                            key={feedback.id}
                                            p={4}
                                            shadow="md"
                                            borderWidth="1px"
                                            direction="column"
                                            transition="all 0.3s ease"
                                            _hover={{ borderColor: 'gray.400' }}
                                        >
                                            <Flex gap="2">
                                                <Flex direction="row" alignItems="center" gap="2">
                                                    <Icon as={IoMdPerson} />
                                                    <Text fontWeight="bold">{name}</Text>
                                                </Flex>
                                                <Spacer />
                                                <IconButton
                                                    title="Marker tilbakemelding som lest/ulest"
                                                    aria-label="Marker tilbakemelding som lest/ulest"
                                                    colorScheme={feedback.isRead ? 'green' : 'gray'}
                                                    icon={feedback.isRead ? <AiOutlineClose /> : <AiOutlineCheck />}
                                                    onClick={() =>
                                                        void handleUpdate({ ...feedback, isRead: !feedback.isRead })
                                                    }
                                                />
                                                {feedback.email && (
                                                    <LinkBox>
                                                        <NextLink href={`mailto:${feedback.email}`} passHref>
                                                            <LinkOverlay isExternal>
                                                                <IconButton
                                                                    title="Send epost"
                                                                    aria-label="Send epost"
                                                                    colorScheme="blue"
                                                                    icon={<AiOutlineMail />}
                                                                />
                                                            </LinkOverlay>
                                                        </NextLink>
                                                    </LinkBox>
                                                )}
                                                <IconButton
                                                    title="Slett tilbakemelding"
                                                    aria-label="Slett tilbakemelding"
                                                    colorScheme="red"
                                                    icon={<AiOutlineDelete />}
                                                    onClick={onOpen}
                                                />

                                                <Modal isOpen={isOpen} onClose={onClose}>
                                                    <ModalOverlay />
                                                    <ModalContent>
                                                        <ModalCloseButton />
                                                        <ModalHeader>
                                                            Er du sikker på at du vil slette denne tilbakemeldingen?
                                                        </ModalHeader>

                                                        <ModalFooter>
                                                            <ButtonGroup>
                                                                <Button
                                                                    colorScheme="red"
                                                                    onClick={() => void handleDelete(feedback.id)}
                                                                >
                                                                    Slett tilbakemelding
                                                                </Button>
                                                                <Button variant="ghost" onClick={onClose}>
                                                                    Lukk
                                                                </Button>
                                                            </ButtonGroup>
                                                        </ModalFooter>
                                                    </ModalContent>
                                                </Modal>
                                            </Flex>
                                            <Divider my="2" />
                                            <Text>{feedback.message}</Text>
                                            <Spacer my="3" />
                                            <Flex fontFamily="mono" direction="row" gap="3" fontSize="md">
                                                <Tag
                                                    onClick={() =>
                                                        void copyToClipboard('Tilbakemelding', feedback.message)
                                                    }
                                                    _hover={{ cursor: 'pointer' }}
                                                >
                                                    <Icon as={MdOutlineContentCopy} />
                                                </Tag>
                                                <Tag
                                                    onClick={() => void copyToClipboard('ID', feedback.id.toString())}
                                                    _hover={{ cursor: 'pointer' }}
                                                >
                                                    #{feedback.id}
                                                </Tag>
                                                <Tag
                                                    onClick={() => void copyToClipboard('Dato', formattedDate)}
                                                    _hover={{ cursor: 'pointer' }}
                                                >
                                                    {formattedDate}
                                                </Tag>
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
