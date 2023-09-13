import type { GetJobAdvertsOptions } from './job-advert';

const createFilterString = (options: GetJobAdvertsOptions) => {
    const companiesList = options.companies.map((name) => `"${name}"`).toString();

    switch (options.filter) {
        case 'only': {
            return `companyName in [${companiesList}]`;
        }
        case 'exclude': {
            return `!(companyName in [${companiesList}])`;
        }
    }
};

// eslint-disable-next-line import/prefer-default-export
export { createFilterString };
