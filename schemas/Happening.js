export default {
    name: 'happening',
    title: 'Arrangement',
    description: 'Et arrangement (fest, workshop, bedpres, osv...).',
    type: 'document',
    preview: {
        select: {
            title: 'title',
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
            name: 'happeningType',
            title: 'Er arrangementet en bedriftspresentasjon?',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: [
                    { title: 'Ja', value: 'BEDPRES' },
                    { title: 'Nei', value: 'EVENT' },
                ],
                layout: 'dropdown',
            },
        },
        {
            name: 'date',
            title: 'Dato for arrangementet',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'body',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'logo',
            title: 'Logo til bedrift',
            validation: (Rule) =>
                Rule.custom((logo, context) =>
                    context.document.happeningType === 'BEDPRES' && typeof logo === 'undefined'
                        ? 'Må ha logo om det er en bedpres.'
                        : true,
                ),
            type: 'image',
        },
        {
            name: 'location',
            title: 'Sted',
            validation: (Rule) => Rule.required(),
            type: 'string',
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
            name: 'companyLink',
            title: 'Lenke til bedrift',
            validation: (Rule) =>
                Rule.custom((logo, context) =>
                    context.document.happeningType === 'BEDPRES' && typeof logo === 'undefined'
                        ? 'Må ha link til bedriften om det er en bedpres.'
                        : true,
                ),
            type: 'url',
        },
        {
            name: 'registrationDate',
            title: 'Dato for påmelding',
            type: 'datetime',
        },
        {
            name: 'additionalQuestions',
            title: 'Tilleggsspørsmål',
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
