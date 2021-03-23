import React from 'react';
import { Center, Box, Heading, Text } from '@chakra-ui/react';

import Layout from '../components/layout';
import SEO from '../components/seo';

const NotFoundPage = (): JSX.Element => (
    <Layout>
        <SEO title="Fant ikke siden" />
        <Center>
            <Box textAlign="center">
                <Heading py="4rem" fontSize="9rem">
                    404
                </Heading>
                <Text fontSize="2rem">Siden eksisterer ikke.</Text>
            </Box>
        </Center>
    </Layout>
);

export default NotFoundPage;
