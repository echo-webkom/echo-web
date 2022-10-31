import { Divider, Flex, Heading, Spacer } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import MapMarkdownChakra from '@utils/markdown';

interface Props {
    heading: string;
    body: string;
}

const Article = ({ heading, body }: Props): JSX.Element => {
    return (
        <>
            <Flex direction="row" alignItems="center">
                <Heading mb="0.2em" size="2xl">
                    {heading}
                </Heading>
                <Spacer />
            </Flex>
            <Divider my=".5em" />
            <Markdown options={{ overrides: MapMarkdownChakra }}>{body}</Markdown>
        </>
    );
};

export default Article;
