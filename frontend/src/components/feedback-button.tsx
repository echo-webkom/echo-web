import {
    Button,
    useDisclosure,
    Text,
    Center,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalFooter,
    ModalBody,
    useColorModeValue,
    VStack,
    FormControl,
    FormLabel,
    Input,
    useToast,
    Textarea,
} from '@chakra-ui/react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { MdOutlineFeedback } from 'react-icons/md';
import { FeedbackAPI, FeedbackResponse, FormValues } from '../lib/api/feedback';

const FeedbackButton = () => {
    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const { onOpen, isOpen, onClose } = useDisclosure();

    const toast = useToast();

    const methods = useForm<FormValues>({
        defaultValues: {},
    });
    const { register, handleSubmit } = methods;

    const submitForm: SubmitHandler<FormValues> = async (data) => {
        await FeedbackAPI.sendFeedback({
            email: data.email,
            name: data.name,
            message: data.message,
        }).then((message: FeedbackResponse) => {
            onClose();
            toast.closeAll();
            toast({
                title: message.title,
                description: message.description,
                status: message.isSuccess ? 'success' : 'error',
                duration: 8000,
                isClosable: true,
            });
        });
    };

    return (
        <>
            <Button
                pos="fixed"
                bottom={[3, null, 5]}
                right={[3, null, 5]}
                colorScheme="button"
                onClick={onOpen}
                bg={bg}
                color={textColor}
                _hover={{ bg: hover }}
                borderRadius="full"
                w="14"
                h="14"
            >
                <Center>
                    <MdOutlineFeedback size={25} />
                </Center>
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="5">
                    <ModalHeader>Send inn tilbakemelding</ModalHeader>
                    <ModalCloseButton />
                    <FormProvider {...methods}>
                        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                        <form data-cy="reg-form" onSubmit={handleSubmit(submitForm)}>
                            <ModalBody>
                                <Text fontSize="md" mb="3">
                                    Din tilbakemelding betyr mye for oss. Gjerne fortell oss hva du ønsker å se på
                                    nettsiden eller hva vi kan gjøre bedre.
                                </Text>
                                <VStack spacing={4}>
                                    <FormControl id="email" isRequired>
                                        <FormLabel>Email</FormLabel>
                                        <Input type="email" {...register('email')} />
                                    </FormControl>
                                    <FormControl id="name" isRequired>
                                        <FormLabel>Navn</FormLabel>
                                        <Input {...register('name')} />
                                    </FormControl>
                                    <FormControl id="message" isRequired>
                                        <FormLabel>Tilbakemelding</FormLabel>
                                        <Textarea {...register('message')} />
                                    </FormControl>
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
                    </FormProvider>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FeedbackButton;
