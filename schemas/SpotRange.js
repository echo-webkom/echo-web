export default {
    name: 'spotRange',
    title: 'Spot Range',
    description: '',
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
            name: 'minDegreeYear',
            title: 'Min Degree Year',
            type: 'number',
            validation: (Rule) => Rule.required().min(1).max(5),
        },
        {
            name: 'maxDegreeYear',
            title: 'Max Degree Year',
            type: 'number',
            validation: (Rule) => Rule.required().min(Rule.valueOfField('minDegreeYear')).max(5),
        },
        {
            name: 'spots',
            title: 'Spots',
            validation: (Rule) => Rule.required(),
            type: 'number',
        },
    ],
};
