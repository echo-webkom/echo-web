export default {
    name: 'additionalQuestion',
    title: 'Additional Question',
    description: 'Ekstra spørsmål til brukeren på en bedpres (f.eks. hvilken mat, allergier osv...)',
    type: 'document',
    preview: {
        select: {
            title: 'questionText',
        },
    },
    fields: [
        {
            name: 'questionText',
            title: 'Question Text',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'inputType',
            title: 'InputType',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: ['radio', 'textbox'],
                layout: 'dropdown',
            },
        },
        {
            name: 'alternatives',
            title: 'Alternatives',
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
