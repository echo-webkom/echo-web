import React from 'react';

import { Tabs, Grid, GridItem, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import MapMarkdownChakra from '../markdown';
import ContentBox from './content-box';

const StaticInfo = ({
    tabNames,
    tabPanels,
}: {
    tabNames: Array<string>;
    tabPanels: Array<React.ReactNode>;
}): JSX.Element => {
    return (
        <Tabs isLazy orientation="vertical">
            <Grid w="100%" templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                <GridItem minW="0" maxW="100%" colSpan={1}>
                    <ContentBox>
                        <TabList>
                            {tabNames.map((tabName: string) => (
                                <Tab key={tabName} whiteSpace="normal" wordBreak="break-word" fontSize="xl">
                                    {tabName}
                                </Tab>
                            ))}
                        </TabList>
                    </ContentBox>
                </GridItem>
                <GridItem minW="0" maxW="100%" colStart={[1, null, null, 2]} colSpan={[1, null, null, 3]} rowSpan={2}>
                    <ContentBox>
                        <TabPanels>
                            {tabPanels.map((node: React.ReactNode) => (
                                <TabPanel>{node}</TabPanel>
                            ))}
                        </TabPanels>
                    </ContentBox>
                </GridItem>
            </Grid>
        </Tabs>
    );
};

export default StaticInfo;
