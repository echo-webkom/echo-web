export default {
    name: 'profile',
    title: 'Profil',
    description: 'Et medlem av en studentgruppe.',
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
            name: 'picture',
            title: 'Bilde',
            type: 'image',
        },
    ],
};
