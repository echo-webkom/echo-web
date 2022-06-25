import {
    useColorModeValue,
    Popover,
    Text,
    PopoverTrigger,
    Button,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    Textarea,
    Stack,
} from '@chakra-ui/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { MdOutlineFeedback } from 'react-icons/md';

type FormValues = {
    email: string;
    message: string;
};

const onSubmit: SubmitHandler<FormValues> = (data) => {
    alert(data);
};

const FeedbackButton = () => {
    const btnBgColor = useColorModeValue('button.light.primary', 'button.dark.primary');
    // const btnTextColor = useColorModeValue('button.light.text', 'button.dark.text');
    const { register, handleSubmit } = useForm<FormValues>();

    return (
        <>
            <Popover>
                <PopoverTrigger>
                    <Button
                        bg={btnBgColor}
                        borderRadius="full"
                        pos="fixed"
                        bottom={['5', '10']}
                        right={['5', '10']}
                        h="60px"
                        w="60px"
                        _hover={{ cursor: 'pointer' }}
                    >
                        <MdOutlineFeedback size={40} color="black" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent mx={['4', '8']}>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Din tilbakemelding er viktig for oss!</PopoverHeader>
                    <PopoverBody>
                        <form onSubmit={void handleSubmit(onSubmit)}>
                            {/* <Stack>
                                <Text fontSize="md">
                                    Gjerne fortell oss på bugs du har funnet, funksjoner du ønsker eller vil fjerne.
                                </Text>
                                <Textarea {...register('message')} placeholder="Skriv her" />
                                <Button type="submit" bg={btnBgColor} textColor={btnTextColor}>
                                    Send
                                </Button>
                            </Stack> */}
                            <input type="email" {...register('email')} />
                            <input type="text" {...register('message')} />

                            <input type="submit" />
                        </form>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </>
    );
};

export default FeedbackButton;
