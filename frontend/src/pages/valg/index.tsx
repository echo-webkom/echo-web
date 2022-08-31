import { Box, Divider, Heading } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import valg from '@static/valg.md';
import Section from '@components/section';
import SEO from '@components/seo';
import MapMarkdownChakra from '@utils/markdown';

const ValgPage = () => {
    return (
        <>
            <SEO title="Valg echo Hovedstyre 2022" />
            <Box>
                <Section>
                    <Heading textAlign="center" mb="0.2em" size="2xl">
                        Husk å bruke stemmeretten din!
                    </Heading>

                    <Divider my="1.5rem" />

                    <Markdown options={{ overrides: MapMarkdownChakra }}>{valg}</Markdown>
                </Section>
            </Box>
        </>
    );
};

export default ValgPage;
