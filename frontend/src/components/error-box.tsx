import { Box, Center, Text } from '@chakra-ui/react';
import React from 'react';

interface Props {
    error: string;
}

const ErrorBox = ({ error }: Props): JSX.Element => {
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
