export default {
    name: 'studentGroup',
    title: 'Studentgruppe',
    description: 'Undergruppe, underorganisasjon eller et echo-styre',
    type: 'document',
    preview: {
        select: {
            title: 'name',
            subtitle: 'groupType',
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
            name: 'slug',
            title: 'Slug (lenke)',
            validation: (Rule) => Rule.required(),
            type: 'slug',
            options: {
                source: 'name',
            },
        },
        {
            name: 'groupType',
            title: 'Type',
            validation: (Rule) =>
                Rule.required()
                    .custom((type) =>
                        type === 'subgroup' || type === 'suborg' || type === 'board' || type === 'intgroup'
                            ? true
                            : 'Må være "subgroup", "suborg", "intgroup" eller "board"',
                    )
                    .error(),
            type: 'string',
            options: {
                list: [
                    { title: 'Undergruppe', value: 'subgroup' },
                    { title: 'Underorganisasjon', value: 'suborg' },
                    { title: 'Hovedstyre', value: 'board' },
                    { title: 'Interessegruppe', value: 'intgroup' },
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
            name: 'grpPicture',
            title: 'Gruppebilde',
            type: 'image',
        },
        {
            name: 'members',
            title: 'Medlemmer',
            type: 'array',
            of: [
                {
                    name: 'member',
                    title: 'Medlem',
                    type: 'object',
                    fields: [
                        {
                            name: 'role',
                            title: 'Rolle',
                            type: 'string',
                        },
                        {
                            name: 'profile',
                            title: 'Profil',
                            type: 'reference',
                            to: [{ type: 'profile' }],
                        },
                    ],
                    preview: {
                        select: {
                            media: 'profile.picture',
                            title: 'profile.name',
                            subtitle: 'role',
                        },
                    },
                },
            ],
        },
    ],
};
