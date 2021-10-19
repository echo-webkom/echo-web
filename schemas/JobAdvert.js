export default {
    name: 'jobAdvert',
    title: 'Job Advert',
    description: 'Stillingsannonse',
    type: 'document',
    preview: {
        select: {
            title: 'companyName',
        },
    },
    fields: [
        {
            name: 'companyName',
            title: 'Company Name',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug',
            validation: (Rule) => Rule.required(),
            type: 'slug',
            options: {
                source: 'companyName',
            },
        },
        {
            name: 'body',
            title: 'Body',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'logo',
            title: 'Logo',
            validation: (Rule) => Rule.required(),
            type: 'image',
        },
        {
            name: 'deadline',
            title: 'Application Deadline',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'city',
            title: 'City',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'jobType',
            title: 'Job Type',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: ['Fulltid', 'Deltid', 'Sommerjobb'],
                layout: 'dropdown',
            },
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
