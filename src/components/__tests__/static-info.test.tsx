import React from 'react';
import Markdown from 'markdown-to-jsx';
import { render } from './testing-utils';
import StaticInfo from '../static-info';
import MapMarkdownChakra from '../../markdown';

const tabNames = ['en fane', 'enda en fane', 'fane 100'];
const markdownFiles = [
    '# masse markdown omg må ha mer enn 20 chars',
    '# enda mer damn ja what sjukt bruh moment',
    '## lorem ipsum dolor sit amet [link](https://google.com)',
];

describe('StaticInfo', () => {
    test('renders without crashing', () => {
        const { getByTestId } = render(
            <StaticInfo
                tabNames={tabNames}
                tabPanels={markdownFiles.map((file) => {
                    return (
                        <Markdown key={file.substring(0, 20)} options={MapMarkdownChakra}>
                            {file}
                        </Markdown>
                    );
                })}
            />,
        );
        expect(getByTestId(/static-info/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        const { getByTestId } = render(
            <StaticInfo
                tabNames={tabNames}
                tabPanels={markdownFiles.map((file) => {
                    return (
                        <Markdown key={file.substring(0, 20)} options={MapMarkdownChakra}>
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
