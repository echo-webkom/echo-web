import { Box, Heading, LinkBox, LinkOverlay, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import { Post } from '../lib/types';
import MapMarkdownChakra from '../markdown';
import ContentBox from './content-box';

const PostPreview = ({ post, className }: { post: Post; className: string }): JSX.Element => {
    const body = post.body.substring(0, 200);
    const { slug } = post;

    return (
        <Box as={ContentBox} className={className}>
            <Heading>{post.title}</Heading>
            <Markdown options={MapMarkdownChakra}>{body}</Markdown>
            <LinkBox>
                <NextLink href={`posts/${slug}`} passHref>
                    <LinkOverlay color="blue.400" as={Link}>
                        Les mer
                    </LinkOverlay>
                </NextLink>
            </LinkBox>
        </Box>
    );
};

export default PostPreview;
