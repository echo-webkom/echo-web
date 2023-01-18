import type { BoxProps } from '@chakra-ui/react';
import { Flex, Heading, Spacer, Text, useBreakpointValue } from '@chakra-ui/react';
import type { Happening } from '@api/happening';
import type { Post } from '@api/post';
import type { JobAdvert } from '@api/job-advert';
import type { RegistrationCount } from '@api/registration';
import ButtonLink from '@components/button-link';
import EntryList from '@components/entry-list';
import Section from '@components/section';
import useLanguage from '@hooks/use-language';

interface Props extends BoxProps {
    title?: string;
    titles?: Array<string>;
    entries: Array<Happening | Post | JobAdvert>;
    entryLimit?: number;
    altText?: string;
    linkTo?: string;
    type: 'event' | 'bedpres' | 'post' | 'job-advert';
    registrationCounts?: Array<RegistrationCount>;
}

const EntryBox = ({
    title,
    titles,
    entries,
    entryLimit,
    altText,
    linkTo,
    type,
    registrationCounts,
    ...props
}: Props) => {
    const isNorwegian = useLanguage();
    const choices = titles ?? [title];
    const heading = useBreakpointValue(choices); // cannot call hooks conditionally

    return (
        <Section w="100%" h="100%" data-cy={`entry-box-${type}`} {...props}>
            <Flex h="100%" direction="column" alignItems="center">
                {heading && <Heading mb="8">{heading}</Heading>}
                {altText && entries.length === 0 && <Text>{altText}</Text>}
                {entries.length > 0 && (
                    <EntryList
                        entries={entries}
                        entryLimit={entryLimit}
                        type={type}
                        registrationCounts={registrationCounts}
                    />
                )}
                <Spacer my="4" />
                {linkTo && (
                    <ButtonLink href={linkTo} transition=".1s ease-out" _hover={{ transform: 'scale(1.05)' }}>
                        {isNorwegian ? 'Se mer' : 'See more'}
                    </ButtonLink>
                )}
            </Flex>
        </Section>
    );
};

export default EntryBox;
