export default {
    name: 'jobAdvert',
    title: 'Job Advert',
    description: 'Stillingsannonse',
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
            name: 'body',
            title: 'Body',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'companyName',
            title: 'Company Name',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'logo',
            title: 'Logo',
            type: 'image',
        },
        {
            name: 'applyByDate',
            title: 'Apply-by Date',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'advertLink',
            title: 'Advert Link',
            validation: (Rule) => Rule.required(),
            type: 'url',
        },
        {
            name: 'degreeYears',
            title: 'Degree Years',
            validation: (Rule) => Rule.required(),
            type: 'array',
            of: [{ type: 'number' }],
        },
    ],
};
