import languages from '../languages';

const localeMarkdown = {
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

const localeString = {
    name: 'localeString',
    title: 'localeString',
    type: 'object',
    fields: languages.map((lang) => ({
        title: lang.title,
        name: lang.id,
        type: 'string',
        validation: lang.isDefault ? (Rule) => Rule.required() : false,
    })),
};

export { localeMarkdown, localeString };
