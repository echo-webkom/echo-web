export default {
    name: 'studentGroup',
    title: 'Student Group',
    description: 'Undergruppe, underorganisasjon eller et echo-styre',
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
            name: 'groupType',
            title: 'Type',
            validation: (Rule) =>
                Rule.required()
                    .custom((type) =>
                        type === 'subgroup' || type === 'suborg' || type === 'board'
                            ? true
                            : 'Må være "subgroup", "suborg" eller "board"',
                    )
                    .error(),
            type: 'string',
        },
        {
            name: 'info',
            title: 'Info',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'roles',
            title: 'Roles',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [
                        {
                            type: 'role',
                        },
                    ],
                },
            ],
        },
    ],
};
