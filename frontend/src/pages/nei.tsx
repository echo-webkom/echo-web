import { Box, Center } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import useLanguage from '@hooks/use-language';
import Section from '@components/section';
import MapMarkdownChakra from '@utils/markdown';

const no = `
# Du er ikke representert av echo

I følge echo sine vedtekter er du ikke representert av echo.
Om du mener dette ikke stemmer, ta kontakt med echo.
Dette kan du gjøre ved å sende mail til
[echo@uib.no](mailto:echo@uib.no).
`;

const en = `
# You are not represented by echo

According to echos bylaws, you are not represented by echo.
If you believe this is incorrect, contact echo.
You can do this by sending an email to
[echo@uib.no](mailto:echo@uib.no).
`;

const NeiPage = () => {
    const isNorwegian = useLanguage();

    return (
        <Section>
            <Center>
                <Box textAlign="center" fontSize="2xl" maxW="3xl">
                    <Markdown options={{ overrides: MapMarkdownChakra }}>{isNorwegian ? no : en}</Markdown>
                </Box>
            </Center>
        </Section>
    );
};

export default NeiPage;
