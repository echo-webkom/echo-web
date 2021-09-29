export default {
    name: 'meetingMinute',
    title: 'Meeting Minute',
    description: 'Møtereferat',
    type: 'document',
    preview: {
        select: {
            title: 'title',
        },
    },
    fields: [
        {
            name: 'title',
            title: 'Title',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'document',
            title: 'Document',
            validation: (Rule) => Rule.required(),
            type: 'file',
        },
        {
            name: 'date',
            title: 'Date',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'allmote',
            title: 'Allmøte',
            validation: (Rule) => Rule.required(),
            type: 'boolean',
        },
    ],
};
