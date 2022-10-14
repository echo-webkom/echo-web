import {
    LinkBox,
    Popover,
    PopoverArrow,
    PopoverTrigger,
    PopoverHeader,
    Text,
    PopoverContent,
    PopoverBody,
    Divider,
    useColorModeValue,
    Box,
} from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import NextLink from 'next/link';
import type { Happening } from '@api/happening';
import capitalize from '@utils/capitalize';

interface Props {
    happening: Happening;
}

const HappeningCalendarBox = ({ happening }: Props) => {
    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');

    return (
        <NextLink href={`/event/${happening.slug}`}>
            <LinkBox
                bg={happening.happeningType === 'BEDPRES' ? bedpresColor : otherColor}
                p="2"
                borderRadius="0.25rem"
                _hover={{ cursor: 'pointer' }}
            >
                <Popover trigger="hover">
                    <PopoverTrigger>
                        <Text noOfLines={1} fontSize="lg" px="1" color="black">
                            {happening.title}
                        </Text>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>
                            {happening.happeningType === 'BEDPRES' ? (
                                <Text as="em" fontWeight="bold" fontSize="sm">
                                    Bedpres
                                </Text>
                            ) : (
                                ''
                            )}
                            <Text fontWeight="extrabold">{happening.title}</Text>
                        </PopoverHeader>
                        <PopoverBody fontSize="lg">
                            <Text mb="2">@ {happening.location}</Text>
                            <Text noOfLines={5}>
                                <Markdown>{happening.body.no}</Markdown>
                            </Text>
                            <Text as="em" fontSize="sm">
                                {capitalize(happening.studentGroupName)}
                            </Text>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </LinkBox>
        </NextLink>
    );
};

export default HappeningCalendarBox;
