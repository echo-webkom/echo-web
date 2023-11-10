import { Box, Center, Heading, Text } from '@chakra-ui/react';
import SEO from '@components/seo';

const NotFoundPage = () => (
    <>
        <SEO title="Fant ikke siden" />
        <Center>
            <Box textAlign="center">
                <Heading py="4rem" fontSize="9rem">
                    404
                </Heading>
                <Text fontSize="2rem">Siden eksisterer ikke.</Text>
            </Box>
        </Center>
    </>
);

export default NotFoundPage;
