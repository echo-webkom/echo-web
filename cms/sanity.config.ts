import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { markdownSchema } from 'sanity-plugin-markdown';
import { media } from 'sanity-plugin-media';
import { colorInput } from '@sanity/color-input';
import { RocketIcon, RobotIcon, TerminalIcon } from '@sanity/icons';
import { schemaTypes } from './schemas';

const defaultConfig = {
    plugins: [deskTool(), visionTool(), markdownSchema(), media(), colorInput()],
    schema: { types: schemaTypes },
    projectId: 'pgq2pd26',
};

export default defineConfig([
    {
        ...defaultConfig,
        name: 'production',
        title: 'echo web',
        icon: RocketIcon,
        basePath: '/prod',
        dataset: 'production',
    },
    {
        ...defaultConfig,
        name: 'develop',
        title: 'echo web – Utvikling',
        icon: TerminalIcon,
        basePath: '/dev',
        dataset: 'develop',
    },
    {
        ...defaultConfig,
        name: 'testing',
        title: 'echo web – Testing',
        icon: RobotIcon,
        basePath: '/test',
        dataset: 'testing',
    },
]);
