export default {
    name: 'post',
    title: 'Innlegg',
    type: 'document',
    preview: {
        select: {
            title: 'title',
            subtitle: 'author.name',
        },
    },
    fields: [
        {
            name: 'title',
            title: 'Tittel',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug (lenke)',
            validation: (Rule) => Rule.required(),
            type: 'slug',
            options: {
                source: 'title',
            },
        },
        {
            name: 'body',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
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
