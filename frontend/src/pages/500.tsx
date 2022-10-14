import { Box, Center, Heading, Text } from '@chakra-ui/react';
import SEO from '@components/seo';

const ErrorPage = (): JSX.Element => (
    <>
        <SEO title="Det har skjedd en feil" />
        <Center>
            <Box textAlign="center">
                <Heading py="4rem" fontSize="9rem">
                    500
                </Heading>
                <Text fontSize="2rem">Det har skjedd en feil.</Text>
            </Box>
        </Center>
    </>
);

export default ErrorPage;
