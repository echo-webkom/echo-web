import slugify from 'slugify';
import { MasterDetailIcon } from '@sanity/icons';
import { ArrayRule, defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
    name: 'jobAdvert',
    title: 'Stillingsannonse',
    icon: MasterDetailIcon,
    type: 'document',
    preview: {
        select: {
            media: 'logo',
            title: 'companyName',
            subtitle: 'jobType',
        },
    },
    fields: [
        defineField({
            name: 'companyName',
            title: 'Navn på bedrift',
            validation: (Rule) => Rule.required(),
            type: 'string',
        }),
        defineField({
            name: 'title',
            title: 'Tittel',
            description: 'Tittel på stillingsannonse, f.eks: "Bekk søker nyutdannede utviklere til bla bla bla"',
            validation: (Rule) => Rule.required(),
            type: 'string',
        }),
        defineField({
            name: 'slug',
            title: 'Slug (link)',
            description: 'Unik identifikator for annonsen. Bruk "Generate"-knappen! Ikke skriv inn på egenhånd!',
            type: 'slug',
            options: {
                source: 'title',
                slugify: (input: string) => slugify(input, { remove: /[*+~.()'"!:@]/g, lower: true, strict: true }),
            },
        }),
        defineField({
            name: 'body',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'markdown',
        }),
        defineField({
            name: 'logo',
            title: 'Logo til bedrift',
            validation: (Rule) => Rule.required(),
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'deadline',
            title: 'Søknadsfrist',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        }),
        defineField({
            name: 'locations',
            title: 'Sted(er)',
            validation: (Rule) => Rule.required().unique(),
            type: 'array',
            of: [defineArrayMember({ type: 'string' })],
        }),
        defineField({
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
        }),
        defineField({
            name: 'advertLink',
            title: 'Lenke til søknad',
            validation: (Rule) => Rule.required(),
            type: 'url',
        }),
        defineField({
            name: 'degreeYears',
            title: 'Aktuelle årstrinn',
            validation: (Rule: ArrayRule<Array<number>>) => [
                Rule.custom((degreeYears) =>
                    degreeYears?.every((year) => year >= 1 && year <= 5) ? true : 'Alle årstrinn må være mellom 1 og 5',
                )
                    .required()
                    .required(),
            ],
            type: 'array',
            of: [defineArrayMember({ type: 'number' })],
        }),
        defineField({
            name: 'weight',
            title: 'Vekting',
            description: 'Høyere vetkting gir høyere plassering av annonsen.',
            validation: (Rule) => Rule.required().integer().positive(),
            type: 'number',
        }),
    ],
});
