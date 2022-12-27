import { UserIcon } from '@sanity/icons';

export default {
    name: 'profile',
    title: 'Profil',
    description: 'Et medlem av en studentgruppe.',
    icon: UserIcon,
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
            options: {
                hotspot: true,
            },
        },
    ],
};
