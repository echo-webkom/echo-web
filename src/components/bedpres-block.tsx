import React from 'react';
import {
    LinkBox,
    LinkOverlay,
    Box,
    Center,
    Text,
    Flex,
    Stack,
    StackDivider,
    Heading,
    Spacer,
    useColorModeValue,
    Avatar,
    useBreakpointValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { format } from 'date-fns';

import { Bedpres } from '../lib/types';
import ContentBox from './content-box';

const BedpresBox = ({ bedpres, testid }: { bedpres: Bedpres; testid?: string }): JSX.Element => {
    const hoverColor = useColorModeValue('gray.100', 'gray.800');

    return (
        <LinkBox data-testid={testid}>
            <Box display="block" p={[0, null, null, null, 5]} _hover={{ backgroundColor: hoverColor }}>
                <Flex verticalAlign="middle">
                    <Avatar size="xl" src={bedpres.logoUrl} alt="firmalogo" />
                    <Center ml="2em">
                        <NextLink href={`/bedpres/${bedpres.slug}`} passHref>
                            <LinkOverlay>
                                <Heading display={['none', 'block']} fontWeight="regular" size="lg">
                                    {bedpres.title}
                                </Heading>
                            </LinkOverlay>
                        </NextLink>
                    </Center>
                    <Spacer />
                    <Center>
                        <Text>{format(new Date(bedpres.date), 'dd. MMM yyyy')}</Text>
                    </Center>
                </Flex>
            </Box>
        </LinkBox>
    );
};

BedpresBox.defaultProps = {
    testid: null,
};

const BedpresBlock = ({
    bedpreses,
    error,
}: {
    bedpreses: Array<Bedpres> | null;
    error: string | null;
}): JSX.Element => {
    const bedpresHeading = useBreakpointValue(['Bedpres', 'Bedpresolini', 'Bedriftspresentasjoner']);

    return (
        <ContentBox testid="bedpres-block">
            <Center>
                <Heading mb=".5em">{bedpresHeading}</Heading>
            </Center>
            <Box>
                {bedpreses && !error && (
                    <Stack spacing={5} divider={<StackDivider />}>
                        {bedpreses.map((bedpres: Bedpres) => {
                            return <BedpresBox key={bedpres.slug} bedpres={bedpres} testid={bedpres.slug} />;
                        })}
                    </Stack>
                )}
                {!bedpreses && error && <Text>{error}</Text>}
            </Box>
        </ContentBox>
    );
};

export default BedpresBlock;
