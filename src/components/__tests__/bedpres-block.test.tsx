import React from 'react';
import { screen } from '@testing-library/react';
import { render } from './testing-utils';
import BedpresBlock from '../bedpres-block';
import { Event } from '../../lib/types/event';

const testEvents: Array<Event> = [
    {
        title: 'Tittel 1',
        slug: 'slug-1',
        date: '1614598294970',
        spots: 23,
        body: 'Lorem ipsum dolor sit amet',
        imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Cute-kittens-12929201-1600-1200.jpg/1200px-Cute-kittens-12929201-1600-1200.jpg',
        location: 'Lokasjon 100',
        publishedAt: '1614598294971',
        author: { authorName: 'Forfatter 1' },
    },
    {
        title: 'Tittel 2',
        slug: 'slug-2',
        date: '1614598294972',
        spots: 24,
        body: 'Lorem ipsum dolor sit amet',
        imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Cute-kittens-12929201-1600-1200.jpg/1200px-Cute-kittens-12929201-1600-1200.jpg',
        location: 'Lokasjon 200',
        publishedAt: '1614598294973',
        author: { authorName: 'Forfatter 2' },
    },
    {
        title: 'Tittel 3',
        slug: 'slug-3',
        date: '1614598294974',
        spots: 25,
        body: 'Lorem ipsum dolor sit amet',
        imageUrl:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Cute-kittens-12929201-1600-1200.jpg/1200px-Cute-kittens-12929201-1600-1200.jpg',
        location: 'Lokasjon 300',
        publishedAt: '1614598294975',
        author: { authorName: 'Forfatter 3' },
    },
];

describe('EventBlock', () => {
    test('renders without crashing', () => {
        render(<BedpresBlock events={testEvents} />);
        expect(screen.getByTestId(/event-block/i)).toBeInTheDocument();
    });
});
