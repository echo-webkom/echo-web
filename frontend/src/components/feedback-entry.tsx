import {
    useToast,
    useDisclosure,
    Divider,
    Tag,
    Button,
    ButtonGroup,
    ModalHeader,
    ModalFooter,
    Flex,
    Spacer,
    Icon,
    IconButton,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalCloseButton,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { IoMdPerson } from 'react-icons/io';
import { AiOutlineClose, AiOutlineCheck, AiOutlineDelete, AiOutlineMail } from 'react-icons/ai';
import { MdOutlineContentCopy } from 'react-icons/md';
import { type Feedback } from '@api/feedback';

interface Props {
    feedback: Feedback;
    handleDelete: (id: number) => Promise<void>;
    handleUpdate: (feedback: Feedback) => Promise<void>;
}

const FeedbackEntry = ({ feedback, handleDelete, handleUpdate }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const formattedDate = format(parseISO(feedback.sentAt), 'yyyy-MM-dd HH:mm');

    const name = feedback.name === '' ? 'Ukjent' : feedback.name;

    const toast = useToast();

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
            <Flex
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
                        onClick={() => void handleUpdate({ ...feedback, isRead: !feedback.isRead })}
                    />
                    {feedback.email && (
                        <a href={`mailto:${feedback.email}`}>
                            <IconButton
                                title="Send epost"
                                aria-label="Send epost"
                                colorScheme="blue"
                                icon={<AiOutlineMail />}
                            />
                        </a>
                    )}
                    <IconButton
                        title="Slett tilbakemelding"
                        aria-label="Slett tilbakemelding"
                        colorScheme="red"
                        icon={<AiOutlineDelete />}
                        onClick={onOpen}
                    />
                </Flex>
                <Divider my="2" />
                <Text>{feedback.message}</Text>
                <Spacer my="3" />
                <Flex fontFamily="mono" direction="row" gap="3" fontSize="md">
                    <Tag
                        onClick={() => void copyToClipboard('Tilbakemelding', feedback.message)}
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
                    <Tag onClick={() => void copyToClipboard('Dato', formattedDate)} _hover={{ cursor: 'pointer' }}>
                        {formattedDate}
                    </Tag>
                </Flex>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />
                    <ModalHeader>Er du sikker på at du vil slette denne tilbakemeldingen?</ModalHeader>

                    <ModalFooter>
                        <ButtonGroup>
                            <Button colorScheme="red" onClick={() => void handleDelete(feedback.id)}>
                                Slett tilbakemelding
                            </Button>
                            <Button variant="ghost" onClick={onClose}>
                                Lukk
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FeedbackEntry;
