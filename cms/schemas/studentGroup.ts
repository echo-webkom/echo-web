import { UsersIcon } from '@sanity/icons';
import slugify from 'slugify';

const GROUP_TYPES = [
    { title: 'Undergruppe', value: 'subgroup' },
    { title: 'Underorganisasjon', value: 'suborg' },
    { title: 'Hovedstyre', value: 'board' },
    { title: 'Interessegruppe', value: 'intgroup' },
];

export default {
    name: 'studentGroup',
    title: 'Studentgruppe',
    description: 'Undergruppe, underorganisasjon eller et echo-styre',
    icon: UsersIcon,
    type: 'document',
    preview: {
        select: {
            title: 'name',
            groupType: 'groupType',
        },
        prepare({ title, groupType }) {
            const [subtitle] = GROUP_TYPES.flatMap((option) => (option.value === groupType ? option.title : []));

            return {
                title,
                subtitle,
            };
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
            description: 'Unik identifikator for studentgruppen. Bruk "Generate"-knappen! Ikke skriv inn på egenhånd!',
            type: 'slug',
            options: {
                source: 'name',
                slugify: (input) => slugify(input, { remove: /[*+~.()'"!:@]/g, lower: true, strict: true }),
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
                list: GROUP_TYPES,
                layout: 'dropdown',
            },
        },
        {
            name: 'info',
            title: 'Brødtekst',
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
