export default {
    name: 'role',
    title: 'Rolle',
    description: 'En rolle som knytter en undergruppe og et medlem',
    type: 'document',
    preview: {
        select: {
            title: 'name',
        },
    },
    fields: [
        {
            name: 'name',
            title: 'Navn',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'studentGroup',
            title: 'Studentgruppe',
            validation: (Rule) => Rule.required(),
            type: 'reference',
            to: [
                {
                    type: 'studentGroup',
                },
            ],
        },
        {
            name: 'members',
            title: 'Medlemmer',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [
                        {
                            type: 'profile',
                        },
                    ],
                },
            ],
        },
    ],
};
