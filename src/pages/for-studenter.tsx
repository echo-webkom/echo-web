import React from 'react';

import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import Layout from '../components/layout';
import SEO from '../components/seo';
import MapMarkdownChakra from '../markdown';
import undergrupper from '../../public/static/for-studenter/undergrupper.md';
import underorganisasjoner from '../../public/static/for-studenter/underorganisasjoner.md';
import masterinfo from '../../public/static/for-studenter/masterinfo.md';

const ForStudenterPage = (): JSX.Element => {
    return (
        <Layout>
            <SEO title="Om Oss" />
            <Tabs defaultIndex={0} align="start" orientation="vertical">
                <TabList padding="2" width="20%" marginBottom="0">
                    <Tab>Undergrupper</Tab>
                    <Tab>Underorganisasjoner</Tab>
                    <Tab>Masterinfo</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{undergrupper}</Markdown>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{underorganisasjoner}</Markdown>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box padding="5">
                            <Markdown options={MapMarkdownChakra}>{masterinfo}</Markdown>
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Layout>
    );
};

export default ForStudenterPage;
