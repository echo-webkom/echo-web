import {
    useColorModeValue,
    Box,
    Popover,
    Text,
    PopoverTrigger,
    Button,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    FormControl,
    Textarea,
    Input,
    Stack,
    FormLabel,
    FormHelperText,
} from '@chakra-ui/react';
import { MdOutlineFeedback } from 'react-icons/md';

const FeedbackButton = () => {
    const btnBgColor = useColorModeValue('button.light.primary', 'button.dark.primary');
    const btnTextColor = useColorModeValue('button.light.text', 'button.dark.text');

    const handleSubmit = (e: HTMLFormElement) => {
        console.log(e);
    };

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
                        <form onSubmit={handleSubmit(submitForm)}>
                            <Stack>
                                <Text fontSize="md">
                                    Gjerne fortell oss på bugs du har funnet, funksjoner du ønsker eller vil fjerne.
                                </Text>
                                <Textarea placeholder="Skriv her" />
                                <Button type="submit" bg={btnBgColor} textColor={btnTextColor}>
                                    Send
                                </Button>
                            </Stack>
                        </form>
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        </>
    );
};

export default FeedbackButton;
