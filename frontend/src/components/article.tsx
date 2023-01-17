import { Divider, Heading } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import MapMarkdownChakra from '@utils/markdown';

interface Props {
    heading: string;
    body: string;
}

const Article = ({ heading, body }: Props) => {
    return (
        <>
            <Heading size="2xl">{heading}</Heading>
            <Divider my=".5em" />
            <Markdown options={{ overrides: MapMarkdownChakra }}>{body}</Markdown>
        </>
    );
};

export default Article;
