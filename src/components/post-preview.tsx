import { Box, Heading, LinkBox, LinkOverlay, Link, Divider, Flex, Text, Spacer } from '@chakra-ui/react';
import NextLink from 'next/link';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import { CgProfile } from 'react-icons/cg';
import { BiCalendar } from 'react-icons/bi';
import { format } from 'date-fns';
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
            <Divider my=".5em" />
            <Flex align="center">
                <CgProfile />
                <Text ml=".5em">{post.author.authorName}</Text>
                <Spacer />
                <BiCalendar />
                <Text ml=".5em">{format(new Date(post.publishedAt), 'dd. MMM yyyy')}</Text>
            </Flex>
            <Divider my=".5em" />
            <LinkBox>
                <NextLink href={`/posts/${slug}`} passHref>
                    <LinkOverlay color="blue.400" as={Link}>
                        Les mer
                    </LinkOverlay>
                </NextLink>
            </LinkBox>
        </Box>
    );
};

export default PostPreview;
