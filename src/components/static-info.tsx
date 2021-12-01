import { Grid, GridItem, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react';
import Section from './section';

interface Props {
    tabNames: Array<string>;
    tabPanels: Array<React.ReactNode>;
}

const StaticInfo = ({ tabNames, tabPanels }: Props): JSX.Element => {
    return (
        <Tabs isLazy orientation="vertical" data-testid="static-info">
            <Grid w="100%" templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                <GridItem minW="0" maxW="100%" colSpan={1}>
                    <Section>
                        <TabList>
                            {tabNames.map((tabName: string) => (
                                <Tab
                                    key={tabName}
                                    data-testid={`${tabName}-tab`}
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    fontSize="xl"
                                >
                                    {tabName}
                                </Tab>
                            ))}
                        </TabList>
                    </Section>
                </GridItem>
                <GridItem minW="0" maxW="100%" colStart={[1, null, null, 2]} colSpan={[1, null, null, 3]} rowSpan={2}>
                    <Section>
                        <TabPanels>
                            {tabPanels.map((node: React.ReactNode, index: number) => (
                                <TabPanel key={index.toString()} data-testid={`${index.toString()}-tabPanel`} p="0">
                                    {node}
                                </TabPanel>
                            ))}
                        </TabPanels>
                    </Section>
                </GridItem>
            </Grid>
        </Tabs>
    );
};

export default StaticInfo;
