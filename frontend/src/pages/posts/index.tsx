import { Center, Divider } from '@chakra-ui/react';
import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import ButtonLink from '@components/button-link';
import PostList from '@components/post-list';
import SEO from '@components/seo';
import type { Post } from '@api/post';
import { PostAPI } from '@api/post';
import { isErrorMessage } from '@utils/error';

interface Props {
    posts: Array<Post>;
}

const PostCollectionPage = ({ posts }: Props): JSX.Element => {
    const router = useRouter();
    const { page } = router.query;
    const pageNumber = Number.parseInt(page as string) || 1;
    const postsPerPage = 6;
    const slicedPosts = posts.slice((pageNumber - 1) * postsPerPage, (pageNumber - 1) * 6 + postsPerPage);

    return (
        <>
            <SEO title="Innlegg" />
            <PostList posts={slicedPosts} />
            <Divider marginTop="8" marginBottom="5" />
            <Center mb="5">
                {pageNumber !== 1 && (
                    <ButtonLink href={`posts?page=${pageNumber - 1}`} w="6rem" mr="0.5rem">
                        Forrige
                    </ButtonLink>
                )}
                {pageNumber * postsPerPage <= posts.length && (
                    <ButtonLink
                        href={`posts?page=${pageNumber + 1}`}
                        w="6rem"
                        ml="0.5rem"
                        transition=".1s ease-out"
                        _hover={{ transform: 'scale(1.05)' }}
                    >
                        Neste
                    </ButtonLink>
                )}
            </Center>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const posts = await PostAPI.getPosts(0); // 0 for all posts

    if (isErrorMessage(posts)) throw new Error(posts.message);

    const props: Props = {
        posts,
    };

    return { props };
};

export default PostCollectionPage;
