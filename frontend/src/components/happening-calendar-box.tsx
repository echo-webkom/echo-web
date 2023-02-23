import {
    Box,
    Popover,
    PopoverArrow,
    PopoverTrigger,
    PopoverHeader,
    Text,
    PopoverContent,
    PopoverBody,
    useColorModeValue,
    LinkBox,
    LinkOverlay,
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
        <LinkBox>
            <Box
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
                    <PopoverContent m="2">
                        <PopoverArrow />
                        <PopoverHeader>
                            {happening.happeningType === 'BEDPRES' && (
                                <Text as="em" fontWeight="bold" fontSize="sm">
                                    Bedpres
                                </Text>
                            )}
                            <LinkOverlay as={NextLink} href={`/event/${happening.slug}`}>
                                <Text fontWeight="extrabold">{happening.title}</Text>
                            </LinkOverlay>
                        </PopoverHeader>
                        <PopoverBody fontSize="lg">
                            <Text mb="2">@ {happening.location}</Text>
                            <Box noOfLines={5}>
                                <Markdown>{happening.body.no}</Markdown>
                            </Box>
                            <Text as="em" fontSize="sm">
                                {capitalize(happening.studentGroupName)}
                            </Text>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </Box>
        </LinkBox>
    );
};

export default HappeningCalendarBox;
