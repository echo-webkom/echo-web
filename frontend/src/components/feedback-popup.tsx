import {
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import type { FeedbackResponse } from '@api/feedback';
import { FeedbackAPI } from '@api/feedback';
import useLanguage from '@hooks/use-language';

const FeedbackPopup = () => {
    const btnRef = useRef<HTMLInputElement>(null);

    const [showPopup, setShowPopup] = useState(false);

    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const isNorwegian = useLanguage();

    const toast = useToast();

    const { onClose } = useDisclosure();

    const { register, handleSubmit, reset } = useForm<{ message: string }>();

    const submitForm: SubmitHandler<{ message: string }> = async (data) => {
        const message: FeedbackResponse = await FeedbackAPI.sendFeedback({
            email: '',
            name: 'Popup tilbakemelding',
            message: data.message,
        });

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
            message: '',
        });
    };

    useEffect(() => {
        const checkFeedbackPopup = () => {
            const lsShowPopup = localStorage.getItem('showFeedbackPopup') ?? 'true';

            setShowPopup(lsShowPopup === 'true');
        };

        checkFeedbackPopup();
    }, [onClose]);

    const handleClose = () => {
        if (btnRef.current?.checked) {
            localStorage.setItem('showFeedbackPopup', 'false');
        }

        setShowPopup(false);
    };
    return (
        <>
            <Modal isOpen={showPopup} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="5">
                    <ModalHeader>
                        {isNorwegian ? 'Webkom trenger din tilbakemelding!' : 'Webkom needs your feedback!'}
                    </ModalHeader>
                    {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                    <form onSubmit={handleSubmit(submitForm)}>
                        <ModalBody>
                            {isNorwegian ? (
                                <Flex direction="column" gap="2" fontSize="md" mb="3">
                                    <Text>
                                        Vi i Webkom ønsker alltid å forbedre på nettsiden, derfor trenger vi din
                                        tilbakemelding på hva vi kan gjøre bedre eller hva det er du ønsker å se på
                                        nettsiden.
                                    </Text>
                                    <Text>Tusen takk.</Text>
                                </Flex>
                            ) : (
                                <Text fontSize="md" mb="3">
                                    <Text>
                                        We at Webkom always want to improve the website, so we need your feedback on
                                        what we can do better or what you would like to see on the website.
                                    </Text>
                                    <Text>Thank you.</Text>
                                </Text>
                            )}
                            <VStack spacing={4}>
                                <FormControl id="message" isRequired>
                                    <FormLabel fontWeight="bold">
                                        {isNorwegian ? 'Tilbakemelding' : 'Feedback'}
                                    </FormLabel>
                                    <Textarea {...register('message')} />
                                </FormControl>
                            </VStack>
                            <Checkbox mt="1" ref={btnRef} defaultChecked={false}>
                                Ikke spør igjen.
                            </Checkbox>
                        </ModalBody>

                        <ModalFooter justifyContent={['center', 'right']} flexWrap="wrap" gap="3">
                            <Button type="submit" bg={bg} color={textColor} _hover={{ bg: hover }}>
                                {isNorwegian ? 'Send inn' : 'Submit'}
                            </Button>
                            <Button variant="ghost" onClick={() => handleClose()}>
                                {isNorwegian ? 'Lukk' : 'Close'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FeedbackPopup;
