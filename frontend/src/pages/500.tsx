import { Box, Center, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import SEO from '@components/seo';
import useLanguage from '@hooks/use-language';

const ErrorPage = () => {
    const router = useRouter();
    const isNorwegian = useLanguage();

    return (
        <>
            <SEO title="Det har skjedd en feil" />
            <Center>
                <Box textAlign="center">
                    <Heading py={['2rem', null, '3rem', '4rem']} fontSize="9rem">
                        500
                    </Heading>
                    <Text fontSize="2rem">
                        {router.query.msg ?? (isNorwegian ? 'Det har skjedd en feil.' : 'An error has occurred')}
                    </Text>
                </Box>
            </Center>
        </>
    );
};

export default ErrorPage;
