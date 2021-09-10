import React from 'react';
import { StudentGroup } from '../../lib/api/student-group';
import StudentGroupSection from '../student-group-section';
import { render } from './testing-utils';

const studentGroups: Array<StudentGroup> = [
    {
        name: 'echo Schmilde',
        info: 'Sick undergruppe ass bruh',
        roles: [
            {
                name: 'Leder',
                members: [
                    {
                        name: 'Mr. Leder McLeder',
                        pictureUrl: 'https://images.ctfassets.net/lederman69',
                    },
                ],
            },
            {
                name: 'Styremedlem',
                members: [
                    {
                        name: 'Ola Nordmann',
                        pictureUrl: 'https://images.ctfassets.net/ola',
                    },
                    {
                        name: 'Test McTest',
                        pictureUrl: null,
                    },
                ],
            },
        ],
    },
    {
        name: 'echo Scwebschkom',
        info: 'Undegruppe McUndergruppeface',
        roles: [
            {
                name: 'Leder',
                members: [
                    {
                        name: 'Mr. CEO',
                        pictureUrl: 'https://images.ctfassets.net/lederman420',
                    },
                ],
            },
            {
                name: 'Styremedlem',
                members: [
                    {
                        name: 'Ola Nordmann',
                        pictureUrl: 'https://images.ctfassets.net/ola',
                    },
                ],
            },
        ],
    },
];

const groupType = 'subgroup';

describe('StudentGroupSection', () => {
    test('renders without crashing', () => {
        const { getByTestId } = render(
            <StudentGroupSection studentGroups={studentGroups} error="" groupType={groupType} />,
        );

        expect(getByTestId(/student-group-section/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        const { getByTestId } = render(
            <StudentGroupSection studentGroups={studentGroups} error="" groupType={groupType} />,
        );

        studentGroups.map((studentGroup) => {
            return expect(getByTestId(new RegExp(`^${studentGroup.name}-tab$`, 'i'))).toBeInTheDocument();
        });

        studentGroups.map((studentGroup) => {
            return expect(getByTestId(new RegExp(`^${studentGroup.name}-tabPanel`, 'i'))).toBeInTheDocument();
        });
    });
});
