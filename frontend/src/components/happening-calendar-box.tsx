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
import type { Happening } from '@api/happening';

const authorColors: { [group: string]: string } = {
    strikkeklubben: '#e67e22',
    heltsikker: '#222',
    'gnist x filmklubb': '#333',
    jarletheman: '#444',
    'echo buldring/klatring': '#555',
    bryggelaget: '#666',
    programmerbar: '#777',
    makerspace: '#888',
    'echo karriere': '#999',
    webkom: '#aaa',
    'echo hovedstyret': '#bbb',
    gnist: 'cyan.500',
    bedkom: '#811',
    tilde: '#191',
};

const getAuthorColor = (author: string) => {
    author = author.toLowerCase();
    return authorColors[author];
};

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
                        <Text
                            noOfLines={1}
                            fontSize="lg"
                            px="1"
                            color="black"
                            borderLeft="3px solid"
                            borderColor={getAuthorColor(happening.studentGroupName)}
                        >
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
                            <Text>@ {happening.location}</Text>
                            <Divider />
                            <Text noOfLines={5}>
                                <Markdown>{happening.body.no}</Markdown>
                            </Text>
                            <Text as="em" fontSize="sm">
                                {happening.studentGroupName}
                            </Text>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </LinkBox>
        </NextLink>
    );
};

export default HappeningCalendarBox;
