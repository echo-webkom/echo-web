module.exports = {
    '*.{js,jsx,ts,tsx}': (filenames) =>
        `next lint --fix --file ${filenames.map((file) => file.split(process.cwd())[1]).join(' --file ')}`,
    '*.{js,jsx,ts,tsx,json,md}': 'prettier --write',
    '*.{yaml,yml}': 'prettier --write --tab-width=2',
};
