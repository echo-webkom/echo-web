import { Button, Center, Divider, StackDivider, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { Post } from '../lib';
import PostPreview from './post-preview';

const PostList = ({ postCollection, totalPosts }: { postCollection: Array<Post>; totalPosts: number }): JSX.Element => {
    const router = useRouter();

    // this is a mess
    const handleClick = (next: boolean) => {
        const { query } = router; // retrieve the router query (e.g. "?page=4")

        // if next or previous button is clicked
        if (next) {
            // check if the router has a page query
            if (query.page) {
                // make sure user cant click next if no more pages
                if (parseInt(query.page as string, 10) + 1 <= Math.ceil(totalPosts / 4)) {
                    query.page = (parseInt(query.page as string, 10) + 1).toString();
                    router.push({
                        query,
                    });
                }
            } else {
                // navigate to page 2 if next is clicked and query is null
                query.page = '2';
                router.push({
                    query,
                });
            }
        } else if (query.page) {
            if (parseInt(query.page as string, 10) > 1) {
                query.page = (parseInt(query.page as string, 10) - 1).toString();
                router.push({
                    query,
                });
            } else {
                // remove query if prev is clickedat page 1 or lower
                router.push({
                    query: null,
                });
            }
        }
    };

    return (
        <>
            <Center>
                {postCollection.length === 0 && <Text>No posts found</Text>}
                {postCollection.length !== 0 && (
                    <VStack
                        className="post-list"
                        divider={<StackDivider borderColor="gray.200" />}
                        spacing={8}
                        align="stretch"
                        width="50%"
                    >
                        {postCollection.map((post: Post) => {
                            return <PostPreview className="post" key={post.slug} post={post} />;
                        })}
                    </VStack>
                )}
            </Center>
            <Divider mb="5" mt="5" />
            <Center>
                {router.query.page && parseInt(router.query.page as string, 10) > 1 && (
                    <Button ml="2" mr="2" onClick={() => handleClick(false)}>
                        Forrige
                    </Button>
                )}
                <Button ml="2" mr="2" onClick={() => handleClick(true)}>
                    Neste
                </Button>
            </Center>
        </>
    );
};

export default PostList;
