import { LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { JobAdvert } from '../lib/api';
import Section from './section';

const JobAdvertPreview = ({ jobAdvert }: { jobAdvert: JobAdvert }): JSX.Element => {
    return (
        <LinkBox w={['100%', null, null, null, '24em']} data-testid={jobAdvert.slug}>
            <NextLink href={`/jobs/${jobAdvert.slug}`} passHref>
                <LinkOverlay>
                    <Section transition="transform 0.1s" pos="relative" _hover={{ transform: 'translateY(-.5rem)' }}>
                        <Text>{jobAdvert.title}</Text>
                    </Section>
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

export default JobAdvertPreview;
