import React from 'react';
import NextLink from 'next/link';
import { Text, Heading, useColorModeValue, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { Post } from '../lib/api/post';
import ContentBox from './content-box';

const Span = ({ children }: { children: React.ReactNode }): JSX.Element => {
    return <span>{children}</span>;
};

const PostCard = ({ post, testid }: { post: Post; testid: string }) => {
    const bg = useColorModeValue('gray.50', 'gray.800');
    const authorBg = useColorModeValue('yellow.400', 'yellow.200');
    const hoverColor = useColorModeValue('gray.200', 'gray.800');
    return (
        <LinkBox w={['100%', null, null, '24em']}>
            <NextLink href={`/posts/${post.slug}`} passHref>
                <LinkOverlay>
                    <ContentBox
                        h={['7em', null, null, '9em']}
                        bg={bg}
                        textAlign="left"
                        p="1em"
                        px="2em"
                        pb="1em"
                        pos="relative"
                        boxShadow="md"
                        data-testid={testid}
                        _hover={{ backgroundColor: hoverColor }}
                    >
                        <Heading size="lg" mb="1em" noOfLines={[2, null, null, 3]}>
                            {post.title}
                        </Heading>
                        {post.author && (
                            <Text pos="absolute" bottom="0" right="8" color="black" bg={authorBg} py="1" px="3">
                                {post.author}
                            </Text>
                        )}
                    </ContentBox>
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

export default PostCard;
