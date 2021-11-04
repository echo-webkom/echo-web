export default {
    name: 'profile',
    title: 'Profil',
    description: 'Et medlem av en studentgruppe.',
    type: 'document',
    preview: {
        select: {
            media: 'picture',
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
