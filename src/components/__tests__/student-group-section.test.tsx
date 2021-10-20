import React from 'react';
import { StudentGroup } from '../../lib/api';
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
                        imageUrl: 'https://cdn.sanity.io/lederman69',
                    },
                ],
            },
            {
                name: 'Styremedlem',
                members: [
                    {
                        name: 'Ola Nordmann',
                        imageUrl: 'https://cdn.sanity.io/ola',
                    },
                    {
                        name: 'Test McTest',
                        imageUrl: null,
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
                        imageUrl: 'https://cdn.sanity.io/lederman420',
                    },
                ],
            },
            {
                name: 'Styremedlem',
                members: [
                    {
                        name: 'Ola Nordmann',
                        imageUrl: 'https://cdn.sanity.io/ola',
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
