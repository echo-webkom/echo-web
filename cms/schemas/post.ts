import slugify from 'slugify';
import { EnvelopeIcon } from '@sanity/icons';

export default {
    name: 'post',
    title: 'Innlegg',
    type: 'document',
    icon: EnvelopeIcon,
    preview: {
        select: {
            title: 'title.no',
            subtitle: 'author.name',
        },
    },
    fields: [
        {
            name: 'publishedOnce',
            type: 'boolean',
            hidden: true,
        },
        {
            name: 'title',
            title: 'Tittel',
            validation: (Rule) => Rule.required(),
            type: 'localeString',
        },
        {
            name: 'slug',
            title: 'Slug (lenke)',
            validation: (Rule) => Rule.required(),
            description: 'Unik identifikator for innlegget. Bruk "Generate"-knappen! Ikke skriv inn på egenhånd!',
            type: 'slug',
            options: {
                source: 'title',
                slugify: (input) => slugify(input, { remove: /[*+~.()'"!:@]/g, lower: true, strict: true }),
            },
        },
        {
            name: 'body',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'localeMarkdown',
        },
        {
            name: 'author',
            title: 'Forfatter',
            validation: (Rule) => Rule.required(),
            type: 'reference',
            to: [
                {
                    type: 'author',
                },
            ],
        },
        {
            name: 'thumbnail',
            title: 'Miniatyrbilde',
            type: 'image',
        },
    ],
};
