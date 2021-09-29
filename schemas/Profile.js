export default {
    name: 'profile',
    title: 'Profile',
    description: 'Et medlem av echo eller en undergruppe',
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
            name: 'picture',
            title: 'Picture',
            type: 'image',
        },
    ],
};
