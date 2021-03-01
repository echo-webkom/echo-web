import React from 'react';

import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import Layout from '../components/layout';
import SEO from '../components/seo';
import MapMarkdownChakra from '../markdown';
import forBedrifter from '../../public/static/for-bedrifter/for-bedrifter.md';
import bedriftspresentasjon from '../../public/static/for-bedrifter/bedriftspresentasjon.md';
import stillingsutlysninger from '../../public/static/for-bedrifter/stillingsutlysninger.md';

const ForBedrifterPage = (): JSX.Element => {
    return (
        <Layout>
            <SEO title="Om Oss" />
            <Tabs defaultIndex={0} align="start" orientation="vertical">
                <TabList padding="2" width="20%" marginBottom="0">
                    <Tab>For bedrifter</Tab>
                    <Tab>Bedriftspresentasjon</Tab>
                    <Tab>Stillingsutlysninger</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{forBedrifter}</Markdown>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{bedriftspresentasjon}</Markdown>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{stillingsutlysninger}</Markdown>
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Layout>
    );
};

export default ForBedrifterPage;
