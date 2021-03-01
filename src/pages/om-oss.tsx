import React from 'react';

import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import Layout from '../components/layout';
import SEO from '../components/seo';
import MapMarkdownChakra from '../markdown';
import hvemErVi from '../../public/static/om-oss/hvem-er-vi.md';
import instituttraadet from '../../public/static/om-oss/instituttraadet.md';
import statutter from '../../public/static/om-oss/statutter.md';

const OmOssPage = (): JSX.Element => {
    return (
        <Layout>
            <SEO title="Om Oss" />
            <Tabs defaultIndex={0} align="start" orientation="vertical">
                <TabList padding="2" width="20%" marginBottom="0">
                    <Tab>Hvem er vi?</Tab>
                    <Tab>Instituttrådet</Tab>
                    <Tab>Statutter</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{hvemErVi}</Markdown>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{instituttraadet}</Markdown>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{statutter}</Markdown>
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Layout>
    );
};

export default OmOssPage;
