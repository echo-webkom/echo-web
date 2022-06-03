import HappeningMetaInfo, { Props } from '../happening-meta-info';
import { HappeningType } from '../../lib/api';

const date = new Date();

const happeningMetaInfoProps: Array<Props> = [
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'no-ls-oe',
        slug: 'no-ls-oe',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: [
            {
                spots: 10,
                minDegreeYear: 1,
                maxDegreeYear: 5,
                regCount: 0,
                waitListCount: 0,
            },
        ],
        spotRangesFromCms: null,
    },
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'io-ls-oe',
        slug: 'io-ls-oe',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: [
            {
                spots: 28,
                minDegreeYear: 1,
                maxDegreeYear: 5,
                regCount: 10,
                waitListCount: 0,
            },
        ],
        spotRangesFromCms: null,
    },
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'no-us-oe',
        slug: 'no-us-oe',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: null,
        spotRangesFromCms: [
            {
                spots: 0,
                minDegreeYear: 1,
                maxDegreeYear: 5,
            },
        ],
    },
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'io-us-oe',
        slug: 'io-us-oe',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: [
            {
                spots: 0,
                minDegreeYear: 1,
                maxDegreeYear: 5,
                regCount: 10123,
                waitListCount: 0,
            },
        ],
        spotRangesFromCms: null,
    },
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'no-ls-ne',
        slug: 'no-ls-ne',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: [
            {
                spots: 8,
                minDegreeYear: 1,
                maxDegreeYear: 2,
                regCount: 0,
                waitListCount: 15,
            },
            {
                spots: 37,
                minDegreeYear: 3,
                maxDegreeYear: 5,
                regCount: 0,
                waitListCount: 0,
            },
        ],
        spotRangesFromCms: null,
    },
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'io-ls-ne',
        slug: 'io-ls-ne',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: [
            {
                spots: 8,
                minDegreeYear: 1,
                maxDegreeYear: 3,
                regCount: 8,
                waitListCount: 0,
            },
            {
                spots: 89,
                minDegreeYear: 4,
                maxDegreeYear: 5,
                regCount: 89,
                waitListCount: 3,
            },
        ],
        spotRangesFromCms: null,
    },
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'no-us-ne',
        slug: 'no-us-ne',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: [
            {
                spots: 0,
                minDegreeYear: 2,
                maxDegreeYear: 4,
                regCount: 0,
                waitListCount: 0,
            },
        ],
        spotRangesFromCms: null,
    },
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'io-us-ne',
        slug: 'io-us-ne',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: [
            {
                spots: 0,
                minDegreeYear: 4,
                maxDegreeYear: 5,
                regCount: 123917,
                waitListCount: 0,
            },
        ],
        spotRangesFromCms: null,
    },
    {
        date: date,
        location: 'Lesesal1',
        locationLink: null,
        type: HappeningType.EVENT,
        title: 'same-deg-year',
        slug: 'same-deg-year',
        contactEmail: 'test@test.com',
        companyLink: null,
        spotRangeCounts: [
            {
                spots: 19,
                minDegreeYear: 4,
                maxDegreeYear: 4,
                regCount: 19,
                waitListCount: 12,
            },
            {
                spots: 123,
                minDegreeYear: 5,
                maxDegreeYear: 5,
                regCount: 123,
                waitListCount: 12,
            },
        ],
        spotRangesFromCms: null,
    },
];

const compId = '[data-cy=happening-meta-info]';

describe('HappeningMetaInfo', () => {
    it('renders without crashing', () => {
        cy.mount(<HappeningMetaInfo {...happeningMetaInfoProps[0]} />);
        cy.get(compId).should('exist');
    });

    it('renders correctly 1', () => {
        const props = happeningMetaInfoProps[0];
        cy.mount(<HappeningMetaInfo {...props} />);

        cy.get(compId).should('contain.text', `${props.spotRangeCounts?.[0].spots ?? 'feil'} plasser`);
    });

    it('renders correctly 2', () => {
        const props = happeningMetaInfoProps[1];
        cy.mount(<HappeningMetaInfo {...props} />);

        cy.get(compId).should(
            'contain.text',
            `${props.spotRangeCounts?.[0].regCount ?? 'feil'}/${props.spotRangeCounts?.[0].spots ?? 'feil'} påmeldt`,
        );
    });

    it('renders correctly 3', () => {
        const props = happeningMetaInfoProps[2];
        cy.mount(<HappeningMetaInfo {...props} />);

        cy.get(compId).should('contain.text', '∞ plasser');
    });

    it('renders correctly 4', () => {
        const props = happeningMetaInfoProps[3];
        cy.mount(<HappeningMetaInfo {...props} />);

        cy.get(compId).should('contain.text', `${props.spotRangeCounts?.[0].regCount ?? 'feil'}/∞ påmeldt`);
    });

    it('renders correctly 5', () => {
        const props = happeningMetaInfoProps[4];
        cy.mount(<HappeningMetaInfo {...props} />);
        const happeningMetaInfo = cy.get(compId);

        props.spotRangeCounts?.map((sr) => {
            happeningMetaInfo.should(
                'contain.text',
                `${sr.spots} plasser for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`,
            );
        });

        const combinedWaitList =
            props.spotRangeCounts?.map((sr) => sr.waitListCount)?.reduce((prev, curr) => prev + curr) ?? 0;

        happeningMetaInfo.should('contain.text', `${combinedWaitList} på venteliste`);
    });

    it('renders correctly 6', () => {
        const props = happeningMetaInfoProps[5];
        cy.mount(<HappeningMetaInfo {...props} />);
        const happeningMetaInfo = cy.get(compId);

        props.spotRangeCounts?.map((sr) => {
            happeningMetaInfo.should('contain.text', `Fullt for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`);
        });

        const combinedWaitList =
            props.spotRangeCounts?.map((sr) => sr.waitListCount)?.reduce((prev, curr) => prev + curr) ?? 0;

        happeningMetaInfo.should('contain.text', `${combinedWaitList} på venteliste`);
    });

    it('renders correctly 7', () => {
        const props = happeningMetaInfoProps[6];
        cy.mount(<HappeningMetaInfo {...props} />);

        cy.get(compId).should('contain.text', '∞ plasser');
    });

    it('renders correctly 8', () => {
        const props = happeningMetaInfoProps[7];
        cy.mount(<HappeningMetaInfo {...props} />);

        props.spotRangeCounts?.map((sr) => {
            cy.get(compId).should('contain.text', `${sr.regCount}/∞ påmeldt`);
        });
    });

    it('renders correctly 9', () => {
        const props = happeningMetaInfoProps[8];
        cy.mount(<HappeningMetaInfo {...props} />);
        const happeningMetaInfo = cy.get(compId);

        props.spotRangeCounts?.map((sr) => {
            happeningMetaInfo.should('contain.text', `Fullt for ${sr.minDegreeYear}. trinn`);
        });

        const combinedWaitList =
            props.spotRangeCounts?.map((sr) => sr.waitListCount)?.reduce((prev, curr) => prev + curr) ?? 0;

        happeningMetaInfo.should('contain.text', `${combinedWaitList} på venteliste`);
    });
});
