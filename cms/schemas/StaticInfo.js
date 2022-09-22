export default {
    name: 'staticInfo',
    title: 'Static Info',
    description: 'Statisk Informasjon',
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
            name: 'section',
            title: 'Seksjon',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: [
                    { title: 'For Studenter', value: 'for-students' },
                    { title: 'For Bedrifter', value: 'for-companies' },
                    { title: 'Om Oss', value: 'about-us' },
                ],
            },
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
            name: 'info',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
    ],
};
