import React from 'react';
import NextLink from 'next/link';
import { Text, Box, Heading, useColorModeValue, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { Post } from '../lib/api/post';
import ContentBox from './content-box';

const PostCard = ({ post, testid }: { post: Post; testid: string }): JSX.Element => {
    const authorBg = useColorModeValue('yellow.400', 'yellow.200');
    const hoverColor = useColorModeValue('gray.200', 'gray.800');
    const bgColor = useColorModeValue('gray.50', 'gray.600');
    return (
        <LinkBox w={['100%', null, null, '24em']}>
            <NextLink href={`/posts/${post.slug}`} passHref>
                <LinkOverlay>
                    <Box
                        h={['7em', null, null, '9em']}
                        textAlign="left"
                        px="2em"
                        pb="10em"
                        data-testid={testid}
                        bg={bgColor}
                        position="relative"
                        _hover={{ backgroundColor: hoverColor }}
                    >
                        <Heading pt="1rem" size="lg" mb="1em" noOfLines={[2, null, null, 3]}>
                            {post.title}
                        </Heading>
                        <Text
                            fontWeight="bold"
                            pos="absolute"
                            bottom="0"
                            right="8"
                            color="black"
                            bg={authorBg}
                            py="0.5rem"
                            px="1rem"
                        >
                            {post.author}
                        </Text>
                    </Box>
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

export default PostCard;
