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
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { MdOutlineFeedback } from 'react-icons/md';
import type { FeedbackResponse, FeedbackFormValues } from '@api/feedback';
import { FeedbackAPI } from '@api/feedback';
import useLanguage from '@hooks/use-language';

const FeedbackButton = () => {
    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const isNorwegian = useLanguage();

    const { onOpen, isOpen, onClose } = useDisclosure();

    const toast = useToast();

    const { register, handleSubmit, reset } = useForm<FeedbackFormValues>();

    const submitForm: SubmitHandler<FeedbackFormValues> = async (data) => {
        const message: FeedbackResponse = await FeedbackAPI.sendFeedback(data);

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
            <Tooltip label={isNorwegian ? 'Send tilbakemelding' : 'Send feedback'} placement="left">
                <IconButton
                    icon={<MdOutlineFeedback size={24} />}
                    aria-label={isNorwegian ? 'Åpne tilbakemeldings skjema' : 'Open feedback form'}
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
                    <ModalHeader>{isNorwegian ? 'Send inn tilbakemelding' : 'Submit feedback'}</ModalHeader>
                    <ModalCloseButton />
                    {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                    <form onSubmit={handleSubmit(submitForm)}>
                        <ModalBody>
                            {isNorwegian ? (
                                <Text fontSize="md" mb="3">
                                    Din tilbakemelding betyr mye for oss. Gjerne fortell oss hva du ønsker å se på
                                    nettsiden eller hva vi kan gjøre bedre. Alternativt kan du også opprette en{' '}
                                    <Link
                                        color="#008eea"
                                        href="https://github.com/echo-webkom/echo-web/issues/new/choose"
                                    >
                                        issue på GitHub
                                    </Link>{' '}
                                    for å rapportere en feil.
                                </Text>
                            ) : (
                                <Text fontSize="md" mb="3">
                                    Your feedback means a lot to us. Please tell us what you want to see on the website
                                    or what we can do better. Alternatively, you can also create an{' '}
                                    <Link
                                        color="#008eea"
                                        href="https://github.com/echo-webkom/echo-web/issues/new/choose"
                                    >
                                        issue on GitHub
                                    </Link>{' '}
                                    to report a bug.
                                </Text>
                            )}
                            <VStack spacing={4}>
                                <FormControl id="email">
                                    <FormLabel fontWeight="bold">{isNorwegian ? 'E-post' : 'Email'}</FormLabel>
                                    <Input type="email" {...register('email')} />
                                </FormControl>
                                <FormControl id="name">
                                    <FormLabel fontWeight="bold">{isNorwegian ? 'Navn' : 'Name'}</FormLabel>
                                    <Input {...register('name')} />
                                </FormControl>
                                <FormControl id="message" isRequired>
                                    <FormLabel fontWeight="bold">
                                        {isNorwegian ? 'Tilbakemelding' : 'Feedback'}
                                    </FormLabel>
                                    <Textarea {...register('message')} />
                                </FormControl>
                                <Text fontSize="sm" fontStyle="italic">
                                    {isNorwegian
                                        ? 'Feltene for navn og e-post er ikke påkrevd, men fylles ut dersom du tillater at vi kontakter deg om tilbakemeldingen.'
                                        : 'The fields for name and e-mail are not required, but are filled in if you allow us to contact you about the feedback.'}
                                </Text>
                            </VStack>
                        </ModalBody>

                        <ModalFooter justifyContent={['center', 'right']} flexWrap="wrap" gap="3">
                            <Button type="submit" bg={bg} color={textColor} _hover={{ bg: hover }}>
                                {isNorwegian ? 'Send inn' : 'Submit'}
                            </Button>
                            <Button variant="ghost" onClick={onClose}>
                                {isNorwegian ? 'Lukk' : 'Close'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FeedbackButton;
