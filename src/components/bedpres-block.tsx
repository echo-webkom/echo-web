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

const BedpresBox = ({ bedpres }: { bedpres: Bedpres }): JSX.Element => {
    const hoverColor = useColorModeValue('gray.100', 'gray.800');

    return (
        <LinkBox>
            <Box display="block" p="5" _hover={{ backgroundColor: hoverColor }}>
                <Flex verticalAlign="middle">
                    <Img
                        htmlWidth="120px"
                        objectFit="cover"
                        borderRadius="100%"
                        src={bedpres.logoUrl}
                        alt="firmalogo"
                    />
                    <Center ml="1em">
                        <NextLink href={`bedpres/${bedpres.slug}`} passHref>
                            <LinkOverlay>{bedpres.title}</LinkOverlay>
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

const BedpresBlock = ({ bedpreses }: { bedpreses: Array<Bedpres> }): JSX.Element => {
    return (
        <ContentBox data-testid="bedpres-block">
            <Heading mb=".5em">Bedriftspresentasjoner</Heading>
            <Box>
                <Stack spacing={5} divider={<StackDivider />}>
                    {bedpreses.map((bedpres: Bedpres) => {
                        return <BedpresBox key={bedpres.slug} bedpres={bedpres} />;
                    })}
                </Stack>
            </Box>
        </ContentBox>
    );
};

export default BedpresBlock;
