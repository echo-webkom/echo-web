import { GridItem, SimpleGrid } from '@chakra-ui/react';
import { isFuture, isPast } from 'date-fns';
import React from 'react';
import { Happening } from '../lib/api';
import EntryBox from './entry-box';

interface Props {
    entries: Array<Happening>;
    error: string | null;
    type: 'event' | 'bedpres';
}

const EntryOverview = ({ entries, error, type }: Props): JSX.Element => {
    const alt = type === 'event' ? 'arrangementer' : 'bedriftspresentasjoner';

    const upcoming = entries.filter((entry: Happening) => {
        return isFuture(new Date(entry.date));
    });
    const past = entries
        .filter((entry: Happening) => {
            return isPast(new Date(entry.date));
        })
        .reverse();

    return (
        <SimpleGrid columns={[1, null, null, 2]} spacing="5">
            <GridItem rowStart={[2, null, null, 1]}>
                <EntryBox
                    title="Tidligere"
                    entries={past}
                    error={error}
                    altText={`Ingen tidligere ${alt}.`}
                    type={type}
                />
            </GridItem>
            <GridItem rowStart={1}>
                <EntryBox
                    title="Kommende"
                    entries={upcoming}
                    error={error}
                    altText={`Ingen kommende ${alt}.`}
                    type={type}
                />
            </GridItem>
        </SimpleGrid>
    );
};

export default EntryOverview;
