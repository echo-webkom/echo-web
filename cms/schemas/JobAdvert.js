import slugify from 'slugify';

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
            description: 'Unik identifikator for annonsen. Bruk "Generate"-knappen! Ikke skriv inn på egenhånd!',
            type: 'slug',
            options: {
                source: 'title',
                slugify: (input) => slugify(input, { remove: /[*+~.()'"!:@]/g, lower: true, strict: true }),
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
            validation: (Rule) => [
                Rule.custom((degreeYears) =>
                    degreeYears.every((year) => year >= 1 && year <= 5) ? true : 'Alle årstrinn må være mellom 1 og 5',
                )
                    .required()
                    .unique(),
            ],
            type: 'array',
            of: [{ type: 'number' }],
        },
        {
            name: 'weight',
            title: 'Vekting',
            description: 'Høyere vetkting gir høyere plassering av annonsen.',
            validation: (Rule) => Rule.required().integer().positive(),
            type: 'number',
        },
    ],
};
