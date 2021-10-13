export default {
    name: 'event',
    title: 'Event',
    description: 'Generelle arrengement',
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
            name: 'date',
            title: 'Date',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'spots',
            title: 'Spots',
            type: 'number',
        },
        {
            name: 'body',
            title: 'Body',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',
        },
        {
            name: 'location',
            title: 'Location',
            validation: (Rule) => Rule.required(),
            type: 'string',
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
            name: 'registrationTime',
            title: 'Registration Time',
            type: 'datetime',
        },
        {
            name: 'additionalQuestions',
            title: 'Additional Questions',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [
                        {
                            type: 'additionalQuestion',
                        },
                    ],
                },
            ],
        },
    ],
};
