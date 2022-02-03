import { BoxProps, Flex, Heading, Spacer, Text, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import { Happening, Post, JobAdvert } from '../lib/api';
import ButtonLink from './button-link';
import EntryList from './entry-list';
import ErrorBox from './error-box';
import Section from './section';

interface Props extends BoxProps {
    title?: string;
    titles?: Array<string>;
    entries: Array<Happening | Post | JobAdvert> | null;
    entryLimit?: number;
    error: string | null;
    altText?: string;
    linkTo?: string;
    type: 'event' | 'bedpres' | 'post' | 'job-advert';
}

const EntryBox = ({
    title,
    titles,
    entries,
    entryLimit,
    error,
    altText,
    linkTo,
    type,
    ...props
}: Props): JSX.Element => {
    const choices = titles ?? [title];
    const heading = useBreakpointValue(choices); // cannot call hooks conditionally

    return (
        <Section w="100%" h="100%" data-cy={`entry-box-${type}`} {...props}>
            <Flex h="100%" direction="column" alignItems="center">
                {heading && <Heading mb="5">{heading}</Heading>}
                {!entries && error && <ErrorBox error={error} />}
                {altText && entries && !error && entries.length === 0 && <Text>{altText}</Text>}
                {entries && !error && entries.length > 0 && (
                    <EntryList entries={entries} entryLimit={entryLimit} type={type} />
                )}
                <Spacer />
                {linkTo && (
                    <ButtonLink linkTo={linkTo} mt="1.5rem">
                        Se mer
                    </ButtonLink>
                )}
            </Flex>
        </Section>
    );
};

export default EntryBox;
