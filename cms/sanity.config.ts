import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { markdownSchema } from 'sanity-plugin-markdown';
import { media } from 'sanity-plugin-media';
import { colorInput } from '@sanity/color-input';
import { schemaTypes } from './schemas';

export default defineConfig({
    name: 'default',
    title: 'echo-web',
    projectId: 'pgq2pd26',
    dataset: 'production',
    plugins: [deskTool(), visionTool(), markdownSchema(), media(), colorInput()],
    schema: {
        types: schemaTypes,
    },
});
