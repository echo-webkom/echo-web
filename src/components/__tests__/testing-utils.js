import { render } from '@testing-library/react';
import AllTheProviders from './testing-wrapper';

const customRender = (ui, options) =>
    render(ui, {
        wrapper: AllTheProviders,
        ...options,
    });

/* eslint-disable import/export */
// re-export everything
export * from '@testing-library/react';
// override render method
export { customRender as render };
/* eslint-enable import/export */
