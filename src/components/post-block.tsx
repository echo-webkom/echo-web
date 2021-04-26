import React from 'react';
import NextLink from 'next/link';
import { Text, Stack, StackDivider, Center, useColorModeValue, LinkBox, LinkOverlay, Button } from '@chakra-ui/react';
import { Post } from '../lib/api/post';
import ContentBox from './content-box';
import PostCard from './post-card';

const PostBlock = ({ posts, error }: { posts: Array<Post> | null; error: string | null }): JSX.Element => {
    const buttonTheme = useColorModeValue('black', 'white');
    return (
        <ContentBox pb="0.5em">
            {posts && !error && posts.length <= 0 && (
                <Center>
                    <Text>Ingen Innlegg</Text>
                </Center>
            )}
            {posts && !error && (
                <Stack direction={['column', null, null, 'row']} spacing={5} divider={<StackDivider />} w="100%">
                    {posts.map((post: Post) => {
                        return <PostCard key={post.slug} post={post} testid={post.slug} />;
                    })}
                </Stack>
            )}
            {!posts && error && <Text>{error}</Text>}
            <Center pt="1em">
                <LinkBox pt="1em" pb="0.5em">
                    <NextLink href="/posts" passHref>
                        <LinkOverlay>
                            <Button>Se mer</Button>
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </Center>
        </ContentBox>
    );
};

export default PostBlock;
