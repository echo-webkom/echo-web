import { Box, Heading, useColorModeValue, Link } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import { Post } from '../lib';
import MapMarkdownChakra from '../markdown';

const PostPreview = ({ post, className }: { post: Post; className: string }): JSX.Element => {
    const body = post.body.substring(0, 200);
    const { slug } = post;
    const boxBg = useColorModeValue('gray.100', 'gray.900');
    return (
        <Box className={className} borderWidth="1px" borderRadius="0.75em" overflow="hidden" pl="6" pr="6" bg={boxBg}>
            <Heading>{post.title}</Heading>
            <Markdown options={MapMarkdownChakra}>{body}</Markdown>
            <Link color="blue.400" href={`posts/${slug}`}>
                Les mer
            </Link>
        </Box>
    );
};

export default PostPreview;
