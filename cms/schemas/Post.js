import slugify from 'slugify';

export default {
    name: 'post',
    title: 'Innlegg',
    type: 'document',
    preview: {
        select: {
            title: 'title.no',
            subtitle: 'author.name',
        },
    },
    fields: [
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
                slugify: (input) => slugify(input),
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
