import React from 'react';
import { Text, Stack, StackDivider, Center, Heading } from '@chakra-ui/react';
import { Post } from '../lib/api/post';
import PostPreview from './post-preview';
import ContentBox from './content-box';
import ButtonLink from './button-link';

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
            <ButtonLink text="Se mer" linkTo="/posts" />
        </ContentBox>
    );
};

export default PostBlock;
