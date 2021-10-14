export default {
    name: 'happening',
    title: 'Happening',
    description: 'Event eller Bedpres',
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
            name: 'happeningType',
            title: 'Happening Type',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: ['EVENT', 'BEDPRES'],
                layout: 'dropdown',
            },
        },
        {
            name: 'date',
            title: 'Date',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'body',
            title: 'Body',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'logo',
            title: 'Logo',
            validation: (Rule) =>
                Rule.custom((logo, context) =>
                    context.document.happeningType === 'BEDPRES' && typeof logo === 'undefined' ? 'Må ha logo' : true,
                ),
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
            name: 'companyLink',
            title: 'Company Link',
            validation: (Rule) =>
                Rule.custom((logo, context) =>
                    context.document.happeningType === 'BEDPRES' && typeof logo === 'undefined'
                        ? 'Må ha link til bedriften'
                        : true,
                ),
            type: 'url',
        },
        {
            name: 'registrationDate',
            title: 'Registration Date',
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
        {
            name: 'spotRanges',
            title: 'Spot Ranges',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [
                        {
                            type: 'spotRange',
                        },
                    ],
                },
            ],
        },
    ],
};
