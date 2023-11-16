import { Heading, LinkBox, LinkOverlay, Text, useBreakpointValue, useColorModeValue } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import removeMD from 'remove-markdown';
import type { Post } from '@api/post';
import hasLongWord from '@utils/has-long-word';
import useLanguage from '@hooks/use-language';

interface Props extends BoxProps {
    post: Post;
}

const PostPreview = ({ post, ...props }: Props) => {
    const authorBg = useColorModeValue('highlight.light.secondary', 'highlight.dark.secondary');
    const borderColor = useColorModeValue('bg.light.border', 'bg.dark.border');
    const bgColor = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');
    const textColor = useColorModeValue('text.light.secondary', 'text.dark.secondary');
    const isMobile = useBreakpointValue([true, false]);
    const isNorwegian = useLanguage();

    const localeTitle = () => {
        /* eslint-disable */
        const output = isNorwegian ? post.title.no : post.title.en ? post.title.en : post.title.no;
        return output;
        /* eslint-enable */
    };

    return (
        <LinkBox
            w="100%"
            data-testid={post.slug}
            border="2px"
            borderColor="transparent"
            borderRadius="0.5rem"
            h="15em"
            textAlign="left"
            px="2em"
            pb="10em"
            bg={bgColor}
            position="relative"
            overflow="visible"
            _hover={{ borderColor: borderColor }}
            alignSelf="center"
            {...props}
        >
            <Heading pt="1rem" size="lg" mb="1em" noOfLines={[2, null, null, 3]}>
                <LinkOverlay as={NextLink} href={`/posts/${post.slug}`}>
                    {isMobile && hasLongWord(localeTitle()) ? [...localeTitle().slice(0, 27), '...'] : localeTitle()}
                </LinkOverlay>
            </Heading>
            <Text fontStyle="italic">
                {`«${removeMD(
                    isNorwegian
                        ? post.body.no.slice(0, 100)
                        : post.body.en
                          ? post.body.en.slice(0, 100)
                          : post.body.no.slice(0, 100),
                )} ...»`}
            </Text>
            <Text
                fontSize="md"
                fontWeight="bold"
                bottom="-5"
                right="8"
                color={textColor}
                bg={authorBg}
                py="0.25rem"
                px="0.8rem"
                borderRadius="0.5rem"
                marginBottom="0.25rem"
                marginTop="-70px"
                position="absolute"
            >
                {post.author}
            </Text>
        </LinkBox>
    );
};

export default PostPreview;
