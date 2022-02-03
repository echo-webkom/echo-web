import { Grid, GridItem, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { NextRouter, useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Section from './section';

interface Props {
    tabNames: Array<string>;
    tabPanels: Array<React.ReactNode>;
}

const InfoPanels = ({ tabNames, tabPanels }: Props): JSX.Element => {
    // Router is null when running Jest tests, do this to
    // force eslint to not remove optional chaining operator.
    const router = useRouter() as NextRouter | null;

    // Same here, eslint is dumb.
    const rawT: Array<string> | string | undefined = router?.query.t;
    const t = rawT?.toString() ?? tabNames[0];

    const initialIndex = tabNames.includes(t) ? tabNames.indexOf(t) : 0;
    const [tabIndex, setTabIndex] = useState(initialIndex);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        const query = tabIndex === 0 ? undefined : { t: tabNames[tabIndex] };

        void router?.replace({ pathname: router.pathname, query: query }, undefined, {
            shallow: false,
        });
    }, [tabIndex]);
    /* eslint-enable react-hooks/exhaustive-deps */

    return (
        <Tabs isLazy onChange={setTabIndex} defaultIndex={tabIndex} orientation="vertical" data-testid="info-panels">
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

export default InfoPanels;
