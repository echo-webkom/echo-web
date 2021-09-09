import { Center, Heading, Text, useBreakpointValue } from '@chakra-ui/react';
import React from 'react';
import { Bedpres } from '../lib/api/bedpres';
import { Event } from '../lib/api/event';
import { Post } from '../lib/api/post';
import ContentBox from './content-box';
import EntryList from './entry-list';
import ErrorBox from './error-box';
import ButtonLink from './button-link';

interface Props {
    title?: string;
    titles?: Array<string>;
    entries: Array<Event | Bedpres | Post> | null;
    entryLimit: number;
    error: string | null;
    altText?: string;
    linkTo?: string;
    type: 'event' | 'bedpres' | 'post';
    direction: 'column' | 'row';
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
    direction,
}: Props): JSX.Element => {
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
            {entries && !error && entries.length !== 0 && (
                <EntryList entries={entries} entryLimit={entryLimit} type={type} direction={direction} />
            )}
            {linkTo && <ButtonLink data-cy="se-mer" text="Se mer" linkTo={linkTo} />}
        </ContentBox>
    );
};

EntryBox.defaultProps = {
    title: undefined,
    titles: undefined,
    entryLimit: undefined,
    linkTo: undefined,
    altText: undefined,
    direction: 'column',
};

export default EntryBox;
