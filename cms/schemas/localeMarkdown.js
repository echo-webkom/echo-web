import languages from '../languages';

export default {
    name: 'localeMarkdown',
    title: 'localeMarkdown',
    type: 'object',
    fields: languages.map((lang) => ({
        title: lang.title,
        name: lang.id,
        type: 'markdown',
        validation: lang.isDefault ? (Rule) => Rule.required() : false,
    })),
};
