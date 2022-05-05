import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

process.env = {
    ...process.env,
    __NEXT_IMAGE_OPTS: {
        deviceSizes: [320, 420, 768, 1024, 1200],
        imageSizes: [],
        domains: ['images.ctfassets.net'],
        path: '/_next/image',
        loader: 'default',
    },
};
