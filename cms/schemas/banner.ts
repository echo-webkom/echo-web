import { InfoOutlineIcon } from '@sanity/icons';

export default {
    name: 'banner',
    title: 'Forsidebanner',
    description: 'Banner som vises øverst på forsiden',
    icon: InfoOutlineIcon,
    type: 'document',
    preview: {
        select: {
            title: 'text',
        },
    },
    fields: [
        {
            name: 'text',
            title: 'Bannertekst',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'color',
            title: 'Bannerfarge',
            validation: (Rule) => Rule.required(),
            type: 'color',
        },
        {
            name: 'textColor',
            title: 'Farge på bannertekst',
            validation: (Rule) => Rule.required(),
            type: 'color',
        },
        {
            name: 'linkTo',
            title: 'Lenke til intern/ekstern side',
            type: 'string',
        },
        {
            name: 'isExternal',
            title: 'Er linken til en ekstern side?',
            description: 'En ekstern side er en side som ikke er på echo.uib.no.',
            type: 'boolean',
            intialValue: false,
        },
    ],
};
