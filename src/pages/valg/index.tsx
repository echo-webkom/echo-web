import React from 'react';
import { Box, Divider, Heading } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import Section from '../../components/section';
import SEO from '../../components/seo';
import MapMarkdownChakra from '../../markdown';
import valg from '../../../public/static/valg.md';

const ValgPage = () => {
    return (
        <>
            <SEO title="Valg echo Hovedstyre 2022" />
            <Box>
                <Section>
                    <Heading textAlign="center" mb="0.2em" size="2xl">
                        Nå kan du stille til valg i echo sitt Hovedstyre!
                    </Heading>

                    <Divider my="1.5rem" />

                    <Markdown options={{ overrides: MapMarkdownChakra }}>{valg}</Markdown>
                </Section>
            </Box>
        </>
    );
};

export default ValgPage;
