import React from 'react';
import { render } from './testing-utils';
import StudentGroupSection from '../student-group-section';
import { StudentGroup } from '../../lib/api/student-group';

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
                        pictureUrl: 'https://bilde.com/lederman69',
                    },
                ],
            },
            {
                name: 'Styremedlem',
                members: [
                    {
                        name: 'Ola Nordmann',
                        pictureUrl: 'https://bilde.com/ola',
                    },
                    {
                        name: 'Test McTest',
                        pictureUrl: 'https://bilde.com/mctest',
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
                        pictureUrl: 'https://bilde.com/lederman420',
                    },
                ],
            },
            {
                name: 'Styremedlem',
                members: [
                    {
                        name: 'Ola Nordmann',
                        pictureUrl: 'https://bilde.com/ola',
                    },
                ],
            },
        ],
    },
];

const groupType = 'subgroup';

describe('StaticInfo', () => {
    test('renders without crashing', () => {
        const { getByTestId } = render(<StudentGroupSection studentGroups={studentGroups} groupType={groupType} />);

        expect(getByTestId(/student-group-section/i)).toBeInTheDocument();
    });

    test('renders correctly', () => {
        const { getByTestId } = render(<StudentGroupSection studentGroups={studentGroups} groupType={groupType} />);

        studentGroups.map((studentGroup) => {
            return expect(getByTestId(new RegExp(`^${studentGroup.name}-tab$`, 'i'))).toBeInTheDocument();
        });

        studentGroups.map((studentGroup) => {
            return expect(getByTestId(new RegExp(`^${studentGroup.name}-tabPanel`, 'i'))).toBeInTheDocument();
        });
    });
});
