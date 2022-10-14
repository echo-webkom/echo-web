import { Box, Center, Heading, Text } from '@chakra-ui/react';

const NeiPage = (): JSX.Element => (
    <Center>
        <Box textAlign="center">
            <Heading py="3rem" fontSize="8rem">
                Nei
            </Heading>
            <Text px="25%" fontSize="2rem">
                Du er ikke medlem av institutt for informatikk. Om du mener dette ikke stemmer, ta kontakt med Webkom.
            </Text>
        </Box>
    </Center>
);

export default NeiPage;
