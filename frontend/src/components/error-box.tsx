import { Box, Center, Text } from '@chakra-ui/react';

interface Props {
    error: string;
}

const ErrorBox = ({ error }: Props) => {
    return (
        <Center>
            <Box p="1em">
                <Text fontWeight="bold">Det har oppstått en feil:</Text>
                <Text>{error}</Text>
            </Box>
        </Center>
    );
};

export default ErrorBox;
