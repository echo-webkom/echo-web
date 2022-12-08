import { Box, Center, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import SEO from '@components/seo';

const ErrorPage = (): JSX.Element => {
    const router = useRouter();

    return (
        <>
            <SEO title="Det har skjedd en feil" />
            <Center>
                <Box textAlign="center">
                    <Heading py={['2rem', null, '3rem', '4rem']} fontSize="9rem">
                        500
                    </Heading>
                    <Text fontSize="2rem">{router.query.msg ?? 'Det har skjedd en feil.'}</Text>
                </Box>
            </Center>
        </>
    );
};

export default ErrorPage;
