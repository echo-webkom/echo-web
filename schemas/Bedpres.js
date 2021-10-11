export default {
    name: 'bedpres',
    title: 'Bedpres',
    description: 'Bedriftspresentasjoner',
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
            validation: (Rule) => Rule.required(),
            type: 'number',
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
            validation: (Rule) => Rule.required(),
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
            validation: (Rule) => Rule.required(),
            type: 'url',
        },
        {
            name: 'registrationTime',
            title: 'Registration Time',
            validation: (Rule) => Rule.required(),
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
            name: 'minDegreeYear',
            title: 'Min Degree Year',
            type: 'number',
            validation: (Rule) => Rule.required().min(1).max(5),
        },
        {
            name: 'maxDegreeYear',
            title: 'Max Degree Year',
            type: 'number',
            validation: (Rule) => Rule.required().min(Rule.valueOfField('minDegreeYear')).max(5),
        },
    ],
};
