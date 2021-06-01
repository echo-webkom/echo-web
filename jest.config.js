module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        'testing-utils.js',
        'testing-wrapper.tsx',
        'mock-responses.ts',
        '<rootDir>/cypress/',
    ],
};
