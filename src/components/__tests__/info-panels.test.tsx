import Markdown from 'markdown-to-jsx';
import React from 'react';
import MapMarkdownChakra from '../../markdown';
import InfoPanels from '../info-panels';
import { render } from './testing-utils';

const tabNames = ['en fane', 'enda en fane', 'fane 100'];
const markdownFiles = [
    '# masse markdown omg må ha mer enn 20 chars',
    '# enda mer damn ja what sjukt bruh moment',
    '## lorem ipsum dolor sit amet [link](https://google.com)',
];

describe('InfoPanels', () => {
    test('renders without crashing', () => {
        const { getByTestId } = render(
            <InfoPanels
                tabNames={tabNames}
                tabPanels={markdownFiles.map((file) => {
                    return (
                        <Markdown key={file.slice(0, 20)} options={{ overrides: MapMarkdownChakra }}>
                            {file}
                        </Markdown>
                    );
                })}
            />,
        );
        expect(getByTestId(/info-panels/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        const { getByTestId } = render(
            <InfoPanels
                tabNames={tabNames}
                tabPanels={markdownFiles.map((file) => {
                    return (
                        <Markdown key={file.slice(0, 20)} options={{ overrides: MapMarkdownChakra }}>
                            {file}
                        </Markdown>
                    );
                })}
            />,
        );

        tabNames.map((tabName) => {
            return expect(getByTestId(new RegExp(`^${tabName}-tab$`, 'i'))).toBeInTheDocument();
        });

        markdownFiles.map((_, i) => {
            return expect(getByTestId(new RegExp(`^${i.toString()}-tabPanel$`, 'i'))).toBeInTheDocument();
        });
    });
});
