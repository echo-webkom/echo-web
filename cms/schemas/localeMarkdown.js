import languages from '../languages';

export default {
    name: 'localeMarkdown',
    title: 'localeMarkdown',
    validation: (Rule) => Rule.required(),
    type: 'object',
    fields: languages.map((lang) => ({
        title: lang.title,
        name: lang.id,
        type: 'markdown',
        validation: lang.isDefault ? (Rule) => Rule.required() : false,
    })),
};
