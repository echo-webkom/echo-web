import React from 'react';
import NextLink from 'next/link';
import { Box, Text, Stack, StackDivider, Heading, Center, LinkBox, LinkOverlay, Button } from '@chakra-ui/react';

import { isBefore } from 'date-fns';
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
    const bedpresesFiltered = bedpreses
        ?.filter((bedpres: Bedpres) => {
            return isBefore(new Date().setHours(0, 0, 0, 0), new Date(bedpres.date));
        })
        .slice(0, 3);

    return (
        <ContentBox testid="bedpres-block">
            <Center wordBreak="break-word">
                <Heading>Bedriftspresentasjoner</Heading>
            </Center>
            <Box my=".5em">
                {bedpreses && !error && bedpresesFiltered && bedpresesFiltered.length === 0 && (
                    <Center>
                        <Text>Ingen kommende bedriftspresentasjoner</Text>
                    </Center>
                )}
                {bedpreses && !error && (
                    <Stack spacing={5} divider={<StackDivider />}>
                        {bedpresesFiltered &&
                            bedpresesFiltered.map((bedpres: Bedpres) => {
                                return <BedpresPreview key={bedpres.slug} bedpres={bedpres} testid={bedpres.slug} />;
                            })}
                    </Stack>
                )}
                {!bedpreses && error && <Text>{error}</Text>}
            </Box>
            <Center>
                <LinkBox>
                    <NextLink href="/bedpres" passHref>
                        <LinkOverlay>
                            <Button w="100%" colorScheme="teal">
                                Se mer
                            </Button>
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </Center>
        </ContentBox>
    );
};

export default BedpresBlock;
