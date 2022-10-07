import { CgWebsite } from 'react-icons/cg';

export default {
    name: 'staticInfo',
    title: 'Static Info',
    icon: CgWebsite,
    description: 'Statisk Informasjon',
    type: 'document',
    preview: {
        select: {
            title: 'name.no',
        },
    },
    fields: [
        {
            name: 'name',
            title: 'Navn',
            validation: (Rule) => Rule.required(),
            type: 'localeString',
        },
        {
            name: 'slug',
            title: 'Slug (lenke)',
            validation: (Rule) => Rule.required(),
            type: 'slug',
            options: {
                source: 'name.no',
            },
        },
        {
            name: 'info',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'localeMarkdown',
        },
    ],
};
