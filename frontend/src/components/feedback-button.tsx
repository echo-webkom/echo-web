import {
    Button,
    Collapse,
    Flex,
    FormControl,
    FormLabel,
    IconButton,
    Input,
    Link,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack,
} from '@chakra-ui/react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { MdClose, MdOutlineFeedback } from 'react-icons/md';
import type { FeedbackFormValues } from '@api/feedback';
import { FeedbackAPI } from '@api/feedback';
import LanguageContext from 'language-context';

const FeedbackButton = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const bg = useColorModeValue('button.light.primary', 'button.dark.primary');
    const formBg = useColorModeValue('#EEE', 'gray.700');
    const hover = useColorModeValue('button.light.primaryHover', 'button.dark.primaryHover');
    const textColor = useColorModeValue('button.light.text', 'button.dark.text');

    const isNorwegian = useContext(LanguageContext);

    const toast = useToast();

    const { register, handleSubmit, reset } = useForm<FeedbackFormValues>();

    const submitForm: SubmitHandler<FeedbackFormValues> = async (data) => {
        const message = await FeedbackAPI.sendFeedback(data);

        onClose();
        toast.closeAll();

        toast({
            title: message.title,
            description: message.description,
            status: message.isSuccess ? 'success' : 'error',
            duration: 8000,
            isClosable: true,
        });

        reset();
    };

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit(submitForm)(e);
                }}
            >
                <Flex
                    pos="fixed"
                    direction="column-reverse"
                    align="end"
                    right="0"
                    bottom="0"
                    m="5"
                    maxW="500px"
                    zIndex="overlay"
                    gap="2"
                >
                    <IconButton
                        icon={isOpen ? <MdClose size={24} /> : <MdOutlineFeedback size={24} />}
                        aria-label="feedback-button"
                        onClick={isOpen ? onClose : onOpen}
                        title={
                            isOpen
                                ? isNorwegian
                                    ? 'Lukk tilbakemeldingsskjema'
                                    : 'Close feedback form'
                                : isNorwegian
                                ? 'Åpne tilbakemeldingsskjema'
                                : 'Open feedback form'
                        }
                        bg={bg}
                        color={textColor}
                        borderRadius={isOpen ? 'lg' : '3xl'}
                        transition="all 0.2s"
                        _hover={{ bg: hover, borderRadius: 'lg' }}
                        w="12"
                        h="12"
                    />

                    <Collapse in={isOpen}>
                        <VStack hidden={!isOpen} p="5" bg={formBg} gap="3" borderRadius="base">
                            <Text fontSize="md">
                                {isNorwegian ? (
                                    <>
                                        Din tilbakemelding betyr mye for oss. Gjerne fortell oss hva du ønsker å se på
                                        nettsiden eller hva vi kan gjøre bedre. Alternativt kan du også opprette en{' '}
                                        <Link
                                            color="#008eea"
                                            href="https://github.com/echo-webkom/echo-web/issues/new/choose"
                                        >
                                            issue på GitHub
                                        </Link>{' '}
                                        for å rapportere en feil.
                                    </>
                                ) : (
                                    <>
                                        Your feedback means a lot to us. Please tell us what you want to see on the
                                        website or what we can do better. Alternatively, you can also create an{' '}
                                        <Link
                                            color="#008eea"
                                            href="https://github.com/echo-webkom/echo-web/issues/new/choose"
                                        >
                                            issue on GitHub
                                        </Link>{' '}
                                        to report a bug.
                                    </>
                                )}
                            </Text>
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
                                    <Textarea maxH="300px" {...register('message')} />
                                </FormControl>
                                <Text fontSize="sm" fontStyle="italic">
                                    {isNorwegian
                                        ? 'Feltene for navn og e-post er ikke påkrevd, men fylles ut dersom du tillater at vi kontakter deg om tilbakemeldingen.'
                                        : 'The fields for name and e-mail are not required, but are filled in if you allow us to contact you about the feedback.'}
                                </Text>
                            </VStack>
                            <Button type="submit" bg={bg} textColor={textColor} _hover={{ bg: hover }}>
                                {isNorwegian ? 'Send tilbakemelding' : 'Send feedback'}
                            </Button>
                        </VStack>
                    </Collapse>
                </Flex>
            </form>
        </>
    );
};

export default FeedbackButton;
