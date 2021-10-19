import { Box, Center, Heading, LinkBox, LinkOverlay, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import removeMD from 'remove-markdown';
import { JobAdvert } from '../lib/api';
import Section from './section';

const JobAdvertPreview = ({ jobAdvert }: { jobAdvert: JobAdvert }): JSX.Element => {
    const authorBg = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');
    const borderColor = useColorModeValue('bg.light.border', 'bg.dark.border');

    return (
        <LinkBox w={['100%', null, null, null, '24em']} data-testid={jobAdvert.slug}>
            <NextLink href={`/jobs/${jobAdvert.slug}`} passHref>
                <LinkOverlay>
                    <Box
                        h="15em"
                        textAlign="left"
                        px="2em"
                        pb="10em"
                        border="2px"
                        borderColor="transparent"
                        position="relative"
                        overflow="hidden"
                        borderRadius="0.5rem"
                        as={Section}
                        _hover={{ borderColor: borderColor }}
                    >
                        <Center>
                            <Heading pt="1rem" size="lg" mb="1em" noOfLines={[2, null, null, 3]}>
                                {jobAdvert.companyName}
                            </Heading>
                        </Center>
                        <Text fontStyle="italic">{`«${removeMD(jobAdvert.body.slice(0, 60))} ...»`}</Text>
                        <Text
                            fontSize="md"
                            fontWeight="bold"
                            pos="absolute"
                            bottom="4"
                            right="10"
                            color="black"
                            bg={authorBg}
                            py="0.5rem"
                            px="1rem"
                            borderRadius="0.5rem"
                            marginBottom="0.25rem"
                        >
                            {jobAdvert.location}
                        </Text>
                        <Text
                            fontSize="md"
                            fontWeight="bold"
                            pos="absolute"
                            bottom="4"
                            left="10"
                            color="black"
                            bg={authorBg}
                            py="0.5rem"
                            px="1rem"
                            borderRadius="0.5rem"
                            marginBottom="0.25rem"
                        >
                            {jobAdvert.jobType}
                        </Text>
                    </Box>
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

export default JobAdvertPreview;
