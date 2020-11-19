import React from 'react';

import { Box, Heading, Center, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Layout from '../components/layout';
import SEO from '../components/seo';

const testPage1 = 'test1test1test1test1test1test1test1test1test1';
const testPage2 = 'test2test2test2test2test2test2test2test2test2';
const testPage3 = 'test3test3test3test3test3test3test3test3test3test3test3vvtest3test3test3';

const OmOssPage = (): JSX.Element => (
    <Layout>
        <SEO title="Om Oss" />
        <Heading size="lg">
            <Center>Om Oss</Center>
        </Heading>
        <Tabs defaultIndex={0} align="center" variant="soft-rounded" variantColor="#231300" orientation="vertical">
            <TabList margin="20%" marginTop="1%" marginBottom="0">
                <Tab>Visste du at?</Tab>
                <Tab>Kontakt Oss</Tab>
                <Tab>Styret</Tab>
            </TabList>
            <TabPanels margin="20%" marginBottom="0" marginTop="0">
                <TabPanel>
                    <Box bgColor="metallicSeaweed.400" height="md">
                        <Text fontSize="md"> {testPage1} </Text>
                    </Box>
                </TabPanel>
                <TabPanel>
                    <Box bgColor="metallicSeaweed.400" height="md">
                        <Text fontSize="md"> {testPage2} </Text>
                    </Box>
                </TabPanel>
                <TabPanel>
                    <Box bgColor="metallicSeaweed.400" height="md">
                        <Text fontSize="md"> {testPage3} </Text>
                    </Box>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </Layout>
);

export default OmOssPage;
