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
} from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import NextLink from 'next/link';
import { HappeningType } from '../lib/api/types';
import getAuthorColor from '../lib/author-colors';

interface Props {
    type: HappeningType;
    title: string;
    slug: string;
    location: string;
    author: string;
    body: string;
}

const HappeningCalendarBox = ({ type, title, slug, location, body, author }: Props) => {
    const bedpresColor = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const otherColor = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');

    return (
        <LinkBox
            bg={type === HappeningType.BEDPRES ? bedpresColor : otherColor}
            p="2"
            borderRadius="0.25rem"
            _hover={{ cursor: 'pointer' }}
        >
            <Popover>
                <PopoverTrigger>
                    <Text
                        noOfLines={1}
                        fontSize="lg"
                        px="1"
                        color="black"
                        borderLeft="3px solid"
                        borderColor={getAuthorColor(author)}
                    >
                        {title}
                    </Text>
                </PopoverTrigger>
                <NextLink href={`/event/${slug}`} passHref>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverHeader>
                            {type === HappeningType.BEDPRES ? (
                                <Text as="em" fontWeight="bold" fontSize="sm">
                                    Bedpres
                                </Text>
                            ) : (
                                ''
                            )}
                            <Text fontWeight="extrabold">{title}</Text>
                        </PopoverHeader>
                        <PopoverBody fontSize="lg">
                            <Text>@ {location}</Text>
                            <Divider />
                            <Text noOfLines={5}>
                                <Markdown>{body}</Markdown>
                            </Text>
                            <Text as="em" fontSize="sm">
                                {author}
                            </Text>
                        </PopoverBody>
                    </PopoverContent>
                </NextLink>
            </Popover>
        </LinkBox>
    );
};

export default HappeningCalendarBox;
