import { BsPencil } from 'react-icons/bs';

export default {
    name: 'author',
    title: 'Forfatter',
    icon: BsPencil,
    description: 'Den som har publisert innholdet (happening, post, osv...). Navn på undergruppe er foretrukket.',
    type: 'document',
    preview: {
        select: {
            title: 'name',
        },
    },
    fields: [
        {
            name: 'name',
            title: 'Forfatter',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
    ],
};
