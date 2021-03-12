import React from 'react';
import { Box, Text, Stack, StackDivider, Heading } from '@chakra-ui/react';

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
            <Heading mb=".5em">Bedriftspresentasjoner</Heading>
            <Box>
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
