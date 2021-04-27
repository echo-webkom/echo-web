import React from 'react';
import { Box, Center, Text } from '@chakra-ui/react';

const ErrorBox = ({ error }: { error: string }): JSX.Element => {
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
