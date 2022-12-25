import { AiOutlineFilePdf } from 'react-icons/ai';

export default {
    name: 'meetingMinute',
    title: 'Møtereferat',
    icon: AiOutlineFilePdf,
    type: 'document',
    preview: {
        select: {
            title: 'title',
        },
    },
    fields: [
        {
            name: 'title',
            title: 'Tittel',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'document',
            title: 'Dokument',
            validation: (Rule) => Rule.required(),
            type: 'file',
        },
        {
            name: 'date',
            title: 'Dato for møte',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'allmote',
            title: 'Er møtet ett allmøte?',
            validation: (Rule) => Rule.required(),
            type: 'boolean',
        },
    ],
};
