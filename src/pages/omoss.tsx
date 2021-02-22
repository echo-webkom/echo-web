import React from 'react';

import {
    Box,
    Heading,
    Center,
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue,
} from '@chakra-ui/react';
import Layout from '../components/layout';
import SEO from '../components/seo';

const testPage1 =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec rhoncus dictum feugiat. Phasellus ut porttitor odio, in euismod orci. Sed lacinia ullamcorper pellentesque. Ut finibus tortor metus, non ultricies massa faucibus id. Donec rutrum ante sed orci feugiat, sit amet porta orci hendrerit. Aenean iaculis rhoncus eros nec fermentum. In tristique scelerisque dui at sagittis. Suspendisse consequat ultricies auctor. Sed odio enim, congue eget cursus dapibus, consectetur eu elit. Quisque vel vulputate nunc. Nullam laoreet feugiat turpis quis molestie. Aenean eget sem ipsum. Aliquam commodo eu justo quis ultricies.';
const testPage2 =
    'Consectetur adipiscing elit. Donec rhoncus dictum feugiat. Phasellus ut porttitor odio, in euismod orci. Sed lacinia ullamcorper pellentesque. Ut finibus tortor metus, non ultricies massa faucibus id. Donec rutrum ante sed orci feugiat, sit amet porta orci hendrerit. Aenean iaculis rhoncus eros nec fermentum. In tristique scelerisque dui at sagittis. Suspendisse consequat ultricies auctor. Sed odio enim, congue eget cursus dapibus, consectetur eu elit. Quisque vel vulputate nunc. Nullam laoreet feugiat turpis quis molestie. Aenean eget sem ipsum. Aliquam commodo eu justo quis ultricies.';
const testPage3 =
    ' Donec rhoncus dictum feugiat. Phasellus ut porttitor odio, in euismod orci. Sed lacinia ullamcorper pellentesque. Ut finibus tortor metus, non ultricies massa faucibus id. Donec rutrum ante sed orci feugiat, sit amet porta orci hendrerit. Aenean iaculis rhoncus eros nec fermentum. In tristique scelerisque dui at sagittis. Suspendisse consequat ultricies auctor. Sed odio enim, congue eget cursus dapibus, consectetur eu elit. Quisque vel vulputate nunc. Nullam laoreet feugiat turpis quis molestie. Aenean eget sem ipsum. Aliquam commodo eu justo quis ultricies.';

const OmOssPage = (): JSX.Element => {
    const borderBg = useColorModeValue('mardiGras.400', 'naplesYellow.400');
    const textColor = useColorModeValue('black', 'white');
    return (
        <Layout>
            <SEO title="Om Oss" />
            <Tabs defaultIndex={0} align="start" variant="soft-rounded" colorScheme="mardiGras" orientation="vertical">
                <TabList padding="2" width="20%" margin="1%" marginBottom="0">
                    <Tab textColor={textColor}> For Studenter</Tab>
                    <Tab textColor={textColor}> For Bedrifter</Tab>
                    <Tab textColor={textColor}> Om Oss</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Box padding="5" borderWidth="0.1em" borderColor={borderBg}>
                            <Text fontSize="md"> {testPage1} </Text>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box padding="5" borderWidth="0.1em" borderColor={borderBg}>
                            <Text fontSize="md"> {testPage2} </Text>
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box padding="5" borderWidth="0.1em" borderColor={borderBg}>
                            <Text fontSize="md"> {testPage3} </Text>
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Layout>
    );
};

export default OmOssPage;
