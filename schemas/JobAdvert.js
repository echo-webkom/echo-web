export default {
    name: 'jobAdvert',
    title: 'Stillingsannonse',
    type: 'document',
    preview: {
        select: {
            media: 'logo',
            title: 'companyName',
            subtitle: 'jobType',
        },
    },
    fields: [
        {
            name: 'companyName',
            title: 'Navn på bedrift',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'title',
            title: 'Tittel',
            description: 'Tittel på stillingsannonse, f.eks: "Bekk søker nyutdannede utviklere til bla bla bla"',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug (link)',
            validation: (Rule) => Rule.required(),
            type: 'slug',
            options: {
                source: 'companyName',
            },
        },
        {
            name: 'body',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        },
        {
            name: 'logo',
            title: 'Logo til bedrift',
            validation: (Rule) => Rule.required(),
            type: 'image',
        },
        {
            name: 'deadline',
            title: 'Søknadsfrist',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'locations',
            title: 'Sted(er)',
            validation: (Rule) => Rule.required().unique(),
            type: 'array',
            of: [{ type: 'string' }],
        },
        {
            name: 'jobType',
            title: 'Stillingstype',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: [
                    { title: 'Fulltid', value: 'fulltime' },
                    { title: 'Deltid', value: 'parttime' },
                    { title: 'Internship', value: 'internship' },
                    { title: 'Sommerjobb', value: 'summerjob' },
                ],
                layout: 'dropdown',
            },
        },
        {
            name: 'advertLink',
            title: 'Lenke til søknad',
            validation: (Rule) => Rule.required(),
            type: 'url',
        },
        {
            name: 'degreeYears',
            title: 'Aktuelle årstrinn',
            validation: (Rule) => Rule.required().unique(),
            type: 'array',
            of: [{ type: 'number' }],
        },
    ],
};
