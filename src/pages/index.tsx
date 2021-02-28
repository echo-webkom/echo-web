import React from 'react';

import {
    useColorModeValue,
    HStack,
    Img,
    Stack,
    Text,
    Heading,
    ListItem,
    UnorderedList,
    SimpleGrid,
    Box,
    Divider,
} from '@chakra-ui/react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Events from '../components/events';
import ContentBox from '../components/content-box';

const echoLogoWhite = '/echo-logo-very-wide-text-only-white.png';
const echoLogoBlack = '/echo-logo-very-wide-text-only.png';
const bekkLogo = '/bekk.png';

const IndexPage = (): JSX.Element => {
    const echoLogo = useColorModeValue(echoLogoBlack, echoLogoWhite);
    const bekkFilter = useColorModeValue('invert(1)', 'invert(0)');

    return (
        <Layout>
            <SEO title="Home" />
            <SimpleGrid columns={[1, null, 2]} spacing="5">
                <Stack spacing="5">
                    <ContentBox>
                        <Heading>echo</Heading>
                        <Divider mb="3" />
                        <HStack>
                            <Box>
                                <Text>
                                    skdfj aølsdkjf aløskjf aløskdjf aølsdkjf aølsdkjf aølskdjf aølsdkj falsødkj
                                    faølsdkfj aølsdkjf aølsjk dfaøls jkdfaøljks d skdfj aølsdkjf aløskjf aløskdjf
                                    aølsdkjf aølsdkjf aølskdjf aølsdkj falsødkj faølsdkfj aølsdkjf aølsjk dfaøls
                                    jkdfaøljks d
                                </Text>
                            </Box>
                            <Img src={echoLogo} htmlWidth="300px" />
                        </HStack>
                    </ContentBox>
                    <ContentBox>
                        <Heading>Bekk</Heading>
                        <Divider mb="3" />
                        <HStack>
                            <Box>
                                <Text>
                                    skdfj aølsdkjf aløskjf aløskdjf aølsdkjf aølsdkjf aølskdjf aølsdkj falsødkj
                                    faølsdkfj aølsdkjf aølsjk dfaøls jkdfaøljks d skdfj aølsdkjf aløskjf aløskdjf
                                    aølsdkjf aølsdkjf aølskdjf aølsdkj falsødkj faølsdkfj aølsdkjf aølsjk dfaøls
                                    jkdfaøljks d skdfj aølsdkjf aløskjf aløskdjf aølsdkjf
                                </Text>
                            </Box>
                            <Img src={bekkLogo} filter={bekkFilter} htmlWidth="300px" />
                        </HStack>
                    </ContentBox>
                    <ContentBox>
                        <Heading>Arrangementer</Heading>
                        <Divider mb="3" />
                        <UnorderedList>
                            <ListItem>
                                <Text>Filmkveld med Tilde</Text>
                            </ListItem>
                            <ListItem>
                                <Text>Kahoot med Gnist</Text>
                            </ListItem>
                            <ListItem>
                                <Text>echo-wan med echo-lan-klanen</Text>
                            </ListItem>
                        </UnorderedList>
                    </ContentBox>
                </Stack>
                <Events />
            </SimpleGrid>
        </Layout>
    );
};

export default IndexPage;
