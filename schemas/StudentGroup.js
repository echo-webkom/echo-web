export default {
    name: 'studentGroup',
    title: 'Studengruppe',
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
            title: 'Navn',
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
            options: {
                list: [
                    { title: 'Undergruppe', value: 'subgroup' },
                    { title: 'Underorganisasjon', value: 'suborg' },
                    { title: 'Hovedstyre', value: 'board' },
                ],
                layout: 'dropdown',
            },
        },
        {
            name: 'info',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'roles',
            title: 'Roller',
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
