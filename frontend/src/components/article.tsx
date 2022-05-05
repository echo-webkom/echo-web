import { Divider, Heading } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import MapMarkdownChakra from '../markdown';

interface Props {
    heading: string;
    body: string;
}

const Article = ({ heading, body }: Props): JSX.Element => {
    return (
        <>
            <Heading mb="0.2em" size="2xl">
                {heading}
            </Heading>
            <Divider my=".5em" />
            <Markdown options={{ overrides: MapMarkdownChakra }}>{body}</Markdown>
        </>
    );
};

export default Article;
