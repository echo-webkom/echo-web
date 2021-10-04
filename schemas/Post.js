export default {
    name: 'post',
    title: 'Post',
    description: 'Generelle innlegg på nettsiden',
    type: 'document',
    preview: {
        select: {
            title: 'title',
        },
    },
    fields: [
        {
            name: 'title',
            title: 'Title',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug',
            validation: (Rule) => Rule.required(),
            type: 'slug',
            options: {
                source: 'title',
            },
        },
        {
            name: 'body',
            title: 'Body',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'author',
            title: 'Author',
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
            title: 'Thumbnail',
            type: 'image',
        },
    ],
};
