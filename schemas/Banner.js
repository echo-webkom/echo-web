export default {
    name: 'banner',
    title: 'Forsidebanner',
    description: 'Banner som vises øverst på forsiden',
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
            type: 'colorPicker',
        },
        {
            name: 'linkTo',
            title: 'Lenke til intern side',
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
