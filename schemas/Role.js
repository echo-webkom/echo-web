export default {
    name: 'role',
    title: 'Role',
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
            title: 'Name',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'studentGroup',
            title: 'Student Group',
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
            title: 'Members',
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
