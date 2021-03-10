import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './testing-utils';
import BedpresBlock from '../bedpres-block';
import { Bedpres } from '../../lib/types';

const testBedpreses: Array<Bedpres> = [
    {
        title: 'Bedriftspresentasjon med Bekk',
        slug: 'bedriftspresentasjon-med-bekk',
        date: '2021-04-22T16:15:00.000Z',
        spots: 35,
        body:
            'Velkommen til bedrifstpresentasjon med Bekk **torsdag 5. september!**\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n**Påmelding**\n\nPåmeldingen er åpen for alle! Det er to påmeldingslinker, velg riktig årstrinn:- 2. klasse:\n\n**Program**\n\n* 16:15 – Velkommen og intro om Bekk\n* 16:30 – (student) prater om hvordan det er å ha sommerjobb i Bekk\n* 16:45 – (Bekker) prater om hvordan det er å være ny i Bekk\n* 17:00 – Spørsmålsrunde',
        logoUrl:
            'https://images.ctfassets.net/7ygn1zpoiz5r/2WuQ8fCIvoLMUnJ2m77dVr/f10a2f53471732d2289d5d7bd5a06967/bekk.png',
        location: 'Lesesalen',
        author: {
            authorName: 'Bo Aanes',
        },
        companyLink: 'https://bekk.no/',
        registrationLinks: [
            {
                link: 'https://forms.new/',
                description: '1. - 2. klasse',
            },
            {
                link: 'https://forms.google.com/',
                description: '3. - 5. klasse',
            },
        ],
        publishedAt: '2021-02-24T14:11:07.592Z',
        registrationTime: '2021-02-27T21:04:00.000Z',
    },
];

describe('BedpresBlock', () => {
    test('renders without crashing', () => {
        render(<BedpresBlock bedpreses={testBedpreses} error="" />);
        expect(screen.getByTestId(/bedpres-block/i)).toBeInTheDocument();
    });
});
