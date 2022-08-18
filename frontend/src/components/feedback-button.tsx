import {
    Button,
    FormControl,
    FormLabel,
    IconButton,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    Tooltip,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { MdOutlineFeedback } from 'react-icons/md';
import { FeedbackAPI, FeedbackResponse, FormValues } from '../lib/api/feedback';

const FeedbackButton = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const { onOpen, isOpen, onClose } = useDisclosure();

    const toast = useToast();

    const { register, handleSubmit, reset } = useForm<FormValues>();

    const submitForm: SubmitHandler<FormValues> = async (data) => {
        const message: FeedbackResponse = await FeedbackAPI.sendFeedback(backendUrl, data);

        onClose();
        toast.closeAll();

        toast({
            title: message.title,
            description: message.description,
            status: message.isSuccess ? 'success' : 'error',
            duration: 8000,
            isClosable: true,
        });

        reset({
            email: '',
            name: '',
            message: '',
        });
    };

    return (
        <>
            <Tooltip label="Send tilbakemelding" placement="left">
                <IconButton
                    icon={<MdOutlineFeedback size={24} />}
                    aria-label="Åpne tilbakemeldings skjema"
                    borderRadius="full"
                    pos="fixed"
                    bottom={5}
                    right={5}
                    p="3"
                    onClick={onOpen}
                    bg={bg}
                    color={textColor}
                    _hover={{ bg: hover }}
                    w="12"
                    h="12"
                    zIndex="100"
                />
            </Tooltip>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="5">
                    <ModalHeader>Send inn tilbakemelding</ModalHeader>
                    <ModalCloseButton />
                    {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                    <form onSubmit={handleSubmit(submitForm)}>
                        <ModalBody>
                            <Text fontSize="md" mb="3">
                                Din tilbakemelding betyr mye for oss. Gjerne fortell oss hva du ønsker å se på nettsiden
                                eller hva vi kan gjøre bedre. Alternativt kan du også opprette en{' '}
                                <Link color="blue" href="https://github.com/echo-webkom/echo-web/issues/new/choose">
                                    issue på GitHub
                                </Link>{' '}
                                for å rapportere en feil.
                            </Text>
                            <VStack spacing={4}>
                                <FormControl id="email">
                                    <FormLabel fontWeight="bold">E-post</FormLabel>
                                    <Input type="email" {...register('email')} />
                                </FormControl>
                                <FormControl id="name">
                                    <FormLabel fontWeight="bold">Navn</FormLabel>
                                    <Input {...register('name')} />
                                </FormControl>
                                <FormControl id="message" isRequired>
                                    <FormLabel fontWeight="bold">Tilbakemelding</FormLabel>
                                    <Textarea {...register('message')} />
                                </FormControl>
                                <Text fontSize="sm" fontStyle="italic">
                                    Feltene for navn og e-post er ikke påkrevd, men fylles ut dersom du tillater at vi
                                    kontakter deg om tilbakemeldingen.
                                </Text>
                            </VStack>
                        </ModalBody>

                        <ModalFooter justifyContent={['center', 'right']} flexWrap="wrap" gap="3">
                            <Button type="submit" bg={bg} color={textColor} _hover={{ bg: hover }}>
                                Send inn
                            </Button>
                            <Button variant="ghost" onClick={onClose}>
                                Lukk
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FeedbackButton;
