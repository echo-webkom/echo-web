export default {
    name: 'spotRange',
    title: 'Arrangementsplasser',
    description: 'Hvor mange plasser som er tildelt hvert trinn på et arrangement.',
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
            name: 'minDegreeYear',
            title: 'Minste trinn',
            type: 'number',
            validation: (Rule) => Rule.required().min(1).max(5),
        },
        {
            name: 'maxDegreeYear',
            title: 'Største trinn',
            type: 'number',
            validation: (Rule) => Rule.required().min(Rule.valueOfField('minDegreeYear')).max(5),
        },
        {
            name: 'spots',
            title: 'Antall plasser',
            validation: (Rule) => Rule.required(),
            type: 'number',
        },
    ],
};
