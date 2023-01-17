import { Box, Center, Heading, Text } from '@chakra-ui/react';
import useLanguage from '@hooks/use-language';

const NeiPage = () => {
    const isNorwegian = useLanguage();

    return (
        <Center>
            <Box textAlign="center">
                <Heading py="3rem" fontSize="8rem">
                    {isNorwegian ? 'Nei' : 'No'}
                </Heading>
                <Text px="20%" fontSize="1.5rem">
                    {isNorwegian
                        ? 'I følge echo sine vedtekter er du ikke representert av echo. Om du mener dette ikke stemmer, ta kontakt med Webkom, f.eks. via tilbakemeldingsskjemaet nederst i høyre hjørne eller på mail webkom-styret@echo.uib.no.'
                        : 'According to echos bylaws, you are not represented by echo. If you believe this is incorrect, please contact Webkom, for example via the feedback form in the bottom right corner or by email webkom-styret@echo.uib.no.'}
                </Text>
            </Box>
        </Center>
    );
};

export default NeiPage;
