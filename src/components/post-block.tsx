import React from 'react';
import NextLink from 'next/link';
import { Text, Stack, StackDivider, Center, Heading, LinkBox, LinkOverlay, Button } from '@chakra-ui/react';
import { Post } from '../lib/api/post';
import PostPreview from './post-preview';
import ContentBox from './content-box';

const PostBlock = ({ posts, error }: { posts: Array<Post> | null; error: string | null }): JSX.Element => {
    return (
        <ContentBox data-testid="post-block">
            <Center>
                <Heading p="1rem" mb=".5em" sizes={['xs', 'md']}>
                    Innlegg
                </Heading>
            </Center>
            {posts && !error && posts.length <= 0 && (
                <Center>
                    <Text>Ingen Innlegg</Text>
                </Center>
            )}
            {posts && !error && (
                <Stack direction={['column', null, null, null, 'row']} spacing={5} divider={<StackDivider />} w="100%">
                    {posts.map((post: Post) => {
                        return <PostPreview key={post.slug} post={post} />;
                    })}
                </Stack>
            )}
            {!posts && error && <Text>{error}</Text>}
            <Center>
                <LinkBox pt="1em" pb="0.5em">
                    <NextLink href="/posts" passHref>
                        <LinkOverlay>
                            <Button colorScheme="teal" mt="1rem" fontSize="xl">
                                Se flere innlegg
                            </Button>
                        </LinkOverlay>
                    </NextLink>
                </LinkBox>
            </Center>
        </ContentBox>
    );
};

export default PostBlock;
