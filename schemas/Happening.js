export default {
    name: 'happening',
    title: 'Arrangement',
    description: 'Et arrangement (fest, workshop, bedpres, osv...).',
    type: 'document',
    preview: {
        select: {
            media: 'logo',
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
                Rule.custom((companyLink, context) =>
                    context.document.happeningType === 'BEDPRES' && typeof companyLink === 'undefined'
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
            name: 'contactEmail',
            title: 'Hvilken email kan man kontakte for f.eks. avmelding?',
            validation: (Rule) =>
                Rule.custom((contactEmail, context) =>
                    context.document.registrationDate && !(contactEmail?.includes('@') ?? false)
                        ? 'Må ha en (gyldig) kontaktemail om det skal være påmelding.'
                        : true,
                ),
            type: 'string',
        },
        {
            name: 'additionalQuestions',
            title: 'Tilleggsspørsmål',
            description: 'Ekstra spørsmål til brukeren på et arrangement (f.eks. hvilken mat, allergier osv...)',
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
            title: 'Arrangementsplasser',
            description: 'Hvor mange plasser som er tildelt hvert trinn på et arrangement.',
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
