import { Center, Divider } from '@chakra-ui/react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import ButtonLink from '../../components/button-link';
import ErrorBox from '../../components/error-box';
import PostList from '../../components/post-list';
import SEO from '../../components/seo';
import { Post, PostAPI } from '../../lib/api';

interface Props {
    posts: Array<Post>;
    error: string | null;
}

const PostCollectionPage = ({ posts, error }: Props): JSX.Element => {
    const router = useRouter();
    const { page } = router.query;
    const pageNumber = Number.parseInt(page as string) || 1;
    const postsPerPage = 6;
    const slicedPosts = posts.slice((pageNumber - 1) * postsPerPage, (pageNumber - 1) * 6 + postsPerPage);

    return (
        <>
            <SEO title="Innlegg" />
            {error && <ErrorBox error={error} />}
            {!error && <PostList posts={slicedPosts} />}
            <Divider my="5" />
            <Center>
                {pageNumber !== 1 && (
                    <ButtonLink linkTo={`posts?page=${pageNumber - 1}`} w="6rem" mr="0.5rem">
                        Forrige
                    </ButtonLink>
                )}
                {pageNumber * postsPerPage <= posts.length && (
                    <ButtonLink linkTo={`posts?page=${pageNumber + 1}`} w="6rem" ml="0.5rem">
                        Neste
                    </ButtonLink>
                )}
            </Center>
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { posts, error } = await PostAPI.getPosts(0); // 0 for all posts

    if (posts) {
        const props: Props = {
            posts,
            error,
        };

        return { props };
    }

    return {
        props: {
            posts: [],
            error,
        },
    };
};

export default PostCollectionPage;
