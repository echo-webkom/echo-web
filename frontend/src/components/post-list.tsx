import { Center, Wrap } from '@chakra-ui/react';
import type { Post } from '@api/post';
import PostPreview from '@components/post-preview';

interface Props {
    posts: Array<Post>;
}

const PostList = ({ posts }: Props) => {
    return (
        <Center>
            <Wrap pt="1rem" className="post-list" spacing={8} paddingBottom="20px" w="100%" justify="center">
                {posts.map((post: Post) => {
                    return <PostPreview key={post.slug} post={post} data-testid={post.slug} w="22em" />;
                })}
            </Wrap>
        </Center>
    );
};

export default PostList;
