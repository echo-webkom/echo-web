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
    Img,
    Heading,
    Spacer,
    useColorModeValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { format } from 'date-fns';

import { Bedpres } from '../lib/types';
import ContentBox from './content-box';

const BedpresBox = ({ bedpres, testid }: { bedpres: Bedpres; testid?: string }): JSX.Element => {
    const hoverColor = useColorModeValue('gray.100', 'gray.800');

    return (
        <LinkBox data-testid={testid}>
            <Box display="block" p="5" _hover={{ backgroundColor: hoverColor }}>
                <Flex verticalAlign="middle">
                    <Img
                        htmlWidth="120px"
                        htmlHeight="120px"
                        objectFit="cover"
                        borderRadius="100%"
                        src={bedpres.logoUrl}
                        alt="firmalogo"
                    />
                    <Center ml="2em">
                        <NextLink href={`/bedpres/${bedpres.slug}`} passHref>
                            <LinkOverlay>
                                <Heading fontWeight="regular" size="lg">
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
    return (
        <ContentBox testid="bedpres-block">
            <Heading mb=".5em">Bedriftspresentasjoner</Heading>
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
