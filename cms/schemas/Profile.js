import { MdPersonOutline } from 'react-icons/md';

export default {
    name: 'profile',
    title: 'Profil',
    description: 'Et medlem av en studentgruppe.',
    icon: MdPersonOutline,
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
