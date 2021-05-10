module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        'testing-utils.js',
        'testing-wrapper.tsx',
        'mock-responses.ts',
        '<rootDir>/cypress/',
    ],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
};
