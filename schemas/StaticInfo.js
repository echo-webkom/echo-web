export default {
    name: 'staticInfo',
    title: 'Static Info',
    description: 'Statisk Informasjon',
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
            name: 'type',
            title: 'Innholdstype',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: [
                    { title: 'Studentgruppe', value: 'studentgroup' },
                    { title: 'Informasjonsside', value: 'infopage' },
                ],
                layout: 'dropdown',
            },
        },
        {
            name: 'staticContent',
            title: 'Innhold',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
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
            hidden: ({ document }) => !(document?.type === 'studentgroup'),
        },
    ],
};
