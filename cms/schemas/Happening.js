import sanityClient from 'part:@sanity/base/client';
import slugify from 'slugify';
import { MdEvent } from 'react-icons/md';

export default {
    name: 'happening',
    title: 'Arrangement',
    description: 'Et arrangement (fest, workshop, bedpres, osv...).',
    icon: MdEvent,
    type: 'document',
    preview: {
        select: {
            media: 'logo',
            title: 'title',
            subtitle: 'studentGroupName',
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
            name: 'slug',
            title: 'Slug (lenke)',
            validation: (Rule) => Rule.required(),
            description: 'Unik identifikator for arrangementet. Bruk "Generate"-knappen! Ikke skriv inn på egenhånd!',
            type: 'slug',
            readOnly: ({ document }) => document?.publishedOnce,
            options: {
                source: 'title',
                slugify: (input) => {
                    const slug = slugify(input, { remove: /[*+~.()'"!:@]/g, lower: true, strict: true });
                    const query = 'count(*[_type == "happening" && slug.current == $slug]{_id})';
                    const params = { slug };
                    return sanityClient
                        .fetch(query, params)
                        .then((count) => (count > 0 ? `${slug}-${count + 1}` : slug));
                },
            },
        },
        {
            name: 'happeningType',
            title: 'Er arrangementet en bedriftspresentasjon?',
            validation: (Rule) => Rule.required(),
            type: 'string',
            options: {
                list: [
                    { title: 'Ja', value: 'BEDPRES' },
                    { title: 'Nei', value: 'EVENT' },
                ],
                layout: 'dropdown',
            },
        },
        {
            name: 'date',
            title: 'Dato for arrangementet',
            validation: (Rule) => Rule.required(),
            type: 'datetime',
        },
        {
            name: 'registrationDate',
            title: 'Påmelding åpner',
            type: 'datetime',
            validation: (Rule) =>
                Rule.custom((registrationDate, context) =>
                    typeof context.document.spotRanges !== 'undefined' &&
                    context.document.spotRanges.length > 0 &&
                    typeof registrationDate === 'undefined'
                        ? 'Må ha dato for påmelding om det er definert arrangementsplasser.'
                        : true,
                ),
        },
        {
            name: 'registrationDeadline',
            title: 'Påmelding stenger',
            type: 'datetime',
            validation: (Rule) => [
                Rule.custom((registrationDeadline, context) =>
                    typeof context.document.registrationDate !== 'undefined' &&
                    typeof registrationDeadline === 'undefined'
                        ? 'Mangler deadline!'
                        : true,
                ),
                Rule.optional().min(Rule.valueOfField('registrationDate')).max(Rule.valueOfField('date')),
            ],
        },
        {
            name: 'studentGroupRegistrationDate',
            title: 'Når skal tidlig påmelding for studentgrupper åpne? Den stenger når vanlig påmelding åpner',
            type: 'datetime',
            validation: (Rule) =>
                Rule.custom((studentGroupRegistrationDate, context) =>
                    typeof context.document.studentGroups !== 'undefined' &&
                    context.document.studentGroups.length > 0 &&
                    typeof studentGroupRegistrationDate === 'undefined'
                        ? 'Må ha dato for tidlig påmelding for studentgrupper om det er definert studentgrupper.'
                        : true,
                ),
        },
        {
            name: 'studentGroups',
            title: 'Hvilke studentgrupper har tidlig påmelding?',
            type: 'array',
            of: [{ type: 'string' }],
            validation: (Rule) =>
                Rule.custom((studentGroups, context) =>
                    typeof context.document.studentGroupRegistrationDate !== 'undefined' &&
                    typeof studentGroups === 'undefined'
                        ? 'Må angi studentgrupper om det er definert tidlig påmelding for studentgrupper.'
                        : true,
                ),
            options: {
                list: [
                    { title: 'Hovedstyret', value: 'hovedstyret' },
                    { title: 'Bedkom', value: 'bedkom' },
                    { title: 'Webkom', value: 'webkom' },
                    { title: 'Gnist', value: 'gnist' },
                    { title: 'Tilde', value: 'tilde' },
                    { title: 'Hyggkom', value: 'hyggkom' },
                    { title: 'ESC', value: 'esc' },
                    { title: 'Makerspace', value: 'makerspace' },
                ],
                layout: 'dropdown',
            },
        },
        {
            name: 'onlyForStudentGroups',
            title: 'Åpen kun for studentgrupper?',
            type: 'boolean',
        },
        {
            name: 'body',
            title: 'Brødtekst',
            validation: (Rule) => Rule.required(),
            type: 'localeMarkdown',
        },
        {
            name: 'logo',
            title: 'Logo til bedrift',
            validation: (Rule) =>
                Rule.custom((logo, context) =>
                    context.document.happeningType === 'BEDPRES' && typeof logo === 'undefined'
                        ? 'Må ha logo om det er en bedpres.'
                        : true,
                ),
            type: 'image',
        },
        {
            name: 'location',
            title: 'Sted',
            validation: (Rule) => Rule.required(),
            type: 'string',
        },
        {
            name: 'locationLink',
            title: 'Url til sted (Google Maps eller MazeMap)',
            type: 'url',
        },
        {
            name: 'companyLink',
            title: 'Lenke til bedrift',
            validation: (Rule) =>
                Rule.custom((companyLink, context) =>
                    context.document.happeningType === 'BEDPRES' && typeof companyLink === 'undefined'
                        ? 'Må ha link til bedriften om det er en bedpres.'
                        : true,
                ),
            type: 'url',
        },
        {
            name: 'contactEmail',
            title: 'Hvem kan man kontakte ved f.eks. avmelding?',
            validation: (Rule) =>
                Rule.custom((contactEmail, context) =>
                    (typeof context.document.registrationDate !== 'undefined' ||
                        typeof context.document.registrationDate !== 'undefined') &&
                    !(contactEmail?.includes('@') ?? false)
                        ? 'Må ha en (gyldig) kontaktemail om det skal være påmelding.'
                        : true,
                ),
            type: 'string',
        },
        {
            name: 'additionalQuestions',
            title: 'Tilleggsspørsmål',
            description: 'Ekstra spørsmål til brukeren på et arrangement (f.eks. hvilken mat, allergier osv...)',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [
                        {
                            type: 'additionalQuestion',
                        },
                    ],
                },
            ],
        },
        {
            name: 'spotRanges',
            title: 'Arrangementsplasser',
            description: 'Hvor mange plasser som er tildelt hvert trinn på et arrangement.',
            type: 'array',
            validation: (Rule) =>
                Rule.custom((spotRanges, context) =>
                    typeof context.document.registrationDate !== 'undefined' &&
                    (typeof spotRanges === 'undefined' || spotRanges?.length === 0)
                        ? 'Må ha arrangementsplasser om det er definert en påmeldingsdato.'
                        : true,
                ),
            of: [
                {
                    type: 'reference',
                    to: [
                        {
                            type: 'spotRange',
                        },
                    ],
                },
            ],
        },
        {
            name: 'studentGroupName',
            title: 'Navn på studentgruppe',
            description: 'Denne gruppen får tilgang til påmeldinger.',
            type: 'string',
            validation: (Rule) => Rule.required(),
            options: {
                list: [
                    { title: 'Hovedstyret', value: 'hovedstyret' },
                    { title: 'Bedkom', value: 'bedkom' },
                    { title: 'Webkom', value: 'webkom' },
                    { title: 'Gnist', value: 'gnist' },
                    { title: 'Tilde', value: 'tilde' },
                    { title: 'Hyggkom', value: 'hyggkom' },
                    { title: 'ESC', value: 'esc' },
                    { title: 'Makerspace', value: 'makerspace' },
                ],
                layout: 'dropdown',
            },
        },
    ],
};
