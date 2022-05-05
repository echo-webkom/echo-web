export default {
    name: 'additionalQuestion',
    title: 'Tilleggsspørsmål',
    description: 'Ekstra spørsmål til brukeren på et arrangement (f.eks. hvilken mat, allergier osv...)',
    type: 'document',
    preview: {
        select: {
            title: 'questionText',
        },
    },
    fields: [
        {
            name: 'questionText',
            title: 'Spørsmålstekst',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'inputType',
            title: 'Input-type',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: ['radio', 'textbox'],
                layout: 'dropdown',
            },
        },
        {
            name: 'alternatives',
            title: 'Alternativer',
            type: 'array',
            of: [
                {
                    type: 'string',
                    options: {
                        layout: 'tags',
                    },
                },
            ],
        },
    ],
};
