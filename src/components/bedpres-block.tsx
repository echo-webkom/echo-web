import React from 'react';
import { Box, Text, Stack, StackDivider, Heading, Center } from '@chakra-ui/react';

import { Bedpres } from '../lib/types';
import ContentBox from './content-box';
import BedpresPreview from './bedpres-preview';

const BedpresBlock = ({
    bedpreses,
    error,
}: {
    bedpreses: Array<Bedpres> | null;
    error: string | null;
}): JSX.Element => {
    return (
        <ContentBox testid="bedpres-block">
            <Center>
                <Heading mb=".5em">Bedriftspresentasjoner</Heading>
            </Center>
            <Box>
                {bedpreses && !error && bedpreses.length === 0 && (
                    <Center>
                        <Text>Ingen kommende bedriftspresentasjoner</Text>
                    </Center>
                )}
                {bedpreses && !error && (
                    <Stack spacing={5} divider={<StackDivider />}>
                        {bedpreses.map((bedpres: Bedpres) => {
                            return <BedpresPreview key={bedpres.slug} bedpres={bedpres} testid={bedpres.slug} />;
                        })}
                    </Stack>
                )}
                {!bedpreses && error && <Text>{error}</Text>}
            </Box>
        </ContentBox>
    );
};

export default BedpresBlock;
