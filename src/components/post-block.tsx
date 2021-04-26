import React from 'react';
import NextLink from 'next/link';
import {
    Box,
    Flex,
    Text,
    Stack,
    StackDivider,
    Heading,
    Center,
    useColorModeValue,
    LinkBox,
    LinkOverlay,
    Button,
    SimpleGrid,
    GridItem,
} from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { Post } from '../lib/types';
import ContentBox from './content-box';
import MapMarkdownChakra from '../markdown';
import PostCard from './post-card';

const PostBlock = ({ posts, error }: { posts: Array<Post> | null; error: string | null }): JSX.Element => {
    const buttonTheme = useColorModeValue('black', 'white');
    return (
        <Center w="100%">
            {posts && !error && posts.length <= 0 && (
                <Center>
                    <Text>Ingen Innlegg</Text>
                </Center>
            )}
            {posts && !error && (
                <Stack direction={['Column', null, null, 'row']} spacing={5} divider={<StackDivider />}>
                    {posts.map((post: Post) => {
                        return <PostCard key={post.slug} post={post} testid={post.slug} />;
                    })}
                    <LinkBox textAlign="end">
                        <NextLink href="/posts" passHref>
                            <LinkOverlay>
                                <Button w="100%" colorScheme={buttonTheme} variant="link">
                                    Se Alle
                                </Button>
                            </LinkOverlay>
                        </NextLink>
                    </LinkBox>
                </Stack>
            )}

            {!posts && error && <Text>{error}</Text>}
        </Center>
    );
};

export default PostBlock;
