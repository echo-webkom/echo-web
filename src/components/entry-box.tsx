import { Button, Center, Heading, LinkBox, LinkOverlay, Text, useBreakpointValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { Bedpres } from '../lib/api/bedpres';
import { Event } from '../lib/api/event';
import ContentBox from './content-box';
import EntryList from './entry-list';
import ErrorBox from './error-box';
import ButtonLink from './button-link';

interface Props {
    title?: string;
    titles?: Array<string>;
    entries: Array<Event | Bedpres> | null;
    error: string | null;
    altText?: string;
    linkTo?: string;
    type: 'event' | 'bedpres';
}

const EntryBox = ({ title, titles, entries, error, altText, linkTo, type }: Props): JSX.Element => {
    const choices = titles || [title];
    const heading = useBreakpointValue(choices); // cannot call hooks conditionally

    return (
        <ContentBox data-cy={`entry-box-${type}`}>
            {heading && (
                <Center minW="0">
                    <Heading mb="5">{heading}</Heading>
                </Center>
            )}
            {!entries && error && <ErrorBox error={error} />}
            {altText && entries && !error && entries.length === 0 && (
                <Center>
                    <Text>{altText}</Text>
                </Center>
            )}
            {entries && !error && entries.length !== 0 && <EntryList entries={entries} type={type} />}
            {linkTo && <ButtonLink data-cy="se-mer" text={'se mer'} linkTo={linkTo} />}
        </ContentBox>
    );
};

EntryBox.defaultProps = {
    title: undefined,
    titles: undefined,
    linkTo: undefined,
    altText: undefined,
};

export default EntryBox;
