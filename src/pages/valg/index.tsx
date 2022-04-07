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
            <SEO title="Valg echo" />
            <Box>
                <Section>
                    <Heading textAlign="center" mb="0.2em" size="4xl">
                        Valg echo
                    </Heading>

                    <Divider mb="0.5em" />

                    <Markdown options={{ overrides: MapMarkdownChakra }}>{valg}</Markdown>
                </Section>
            </Box>
        </>
    );
};

export default ValgPage;
