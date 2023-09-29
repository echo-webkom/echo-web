import type { JobAdvert } from '@api/job-advert';

const translateJobType = (jobType: JobAdvert['jobType'], isNorwegian: boolean = true): string => {
    switch (jobType) {
        case 'fulltime': {
            return isNorwegian ? 'Fulltid' : 'Full time';
        }
        case 'parttime': {
            return isNorwegian ? 'Deltid' : 'Part time';
        }
        case 'internship': {
            return 'Internship';
        }
        case 'summerjob': {
            return isNorwegian ? 'Sommerjobb' : 'Summer internship';
        }
        case 'event': {
            return 'Event';
        }
    }
};

export default translateJobType;
