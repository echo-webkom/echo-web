module.exports = {
    '*.{ts,tsx}': (filenames) =>
        `next lint --fix --file ${filenames.map((file) => file.split(process.cwd())[1]).join(' --file ')}`,
    '*.{js,jsx}': 'eslint --fix -c cms/package.json',
    '*.{js,jsx,ts,tsx,json,md}': 'prettier --write',
    '*.{yaml,yml}': 'prettier --write --tab-width=2',
};
