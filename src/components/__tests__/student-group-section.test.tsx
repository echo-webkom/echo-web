import React from 'react';
import { StudentGroup } from '../../lib/api';
import StudentGroupSection from '../student-group-section';
import { render } from './testing-utils';

const studentGroups: Array<StudentGroup> = [
    {
        name: 'echo Schmilde',
        slug: 'echo-schmilde',
        info: 'Sick undergruppe ass bruh',
        members: [
            {
                role: 'Leder',
                profile: {
                    name: 'Mr. Leder McLeder',
                    imageUrl: 'https://cdn.sanity.io/lederman69',
                },
            },
            {
                role: 'Styremedlem',
                profile: {
                    name: 'Ola Nordmann',
                    imageUrl: 'https://cdn.sanity.io/ola',
                },
            },
            {
                role: 'Styremedlem',
                profile: {
                    name: 'Test McTest',
                    imageUrl: null,
                },
            },
        ],
    },
    {
        name: 'echo Scwebschkom',
        slug: 'echo-scwebschkom',
        info: 'Undegruppe McUndergruppeface',
        members: [
            {
                role: 'Leder',
                profile: {
                    name: 'Mr. CEO',
                    imageUrl: 'https://cdn.sanity.io/lederman420',
                },
            },
            {
                role: 'Styremedlem',
                profile: {
                    name: 'Ola Nordmann',
                    imageUrl: 'https://cdn.sanity.io/ola',
                },
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
            return expect(getByTestId(new RegExp(`^${studentGroup.name}`, 'i'))).toBeInTheDocument();
        });
    });
});
