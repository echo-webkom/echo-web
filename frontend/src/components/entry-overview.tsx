import { GridItem, SimpleGrid } from '@chakra-ui/react';
import { isFuture, isPast } from 'date-fns';
import type { Happening } from '@api/happening';
import EntryBox from '@components/entry-box';
import useLanguage from '@hooks/use-language';

interface Props {
    entries: Array<Happening>;
    type: 'event' | 'bedpres';
}

const EntryOverview = ({ entries, type }: Props): JSX.Element => {
    const alt = type === 'event' ? 'arrangementer' : 'bedriftspresentasjoner';
    const isNorwegian = useLanguage();

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
                    title={isNorwegian ? 'Tidligere' : 'Previous'}
                    entries={past}
                    altText={isNorwegian ? `Ingen tidligere ${alt}.` : `No previous ${alt}.`}
                    type={type}
                />
            </GridItem>
            <GridItem rowStart={1}>
                <EntryBox
                    title={isNorwegian ? 'Kommende' : 'Upcoming'}
                    entries={upcoming}
                    altText={isNorwegian ? `Ingen kommende ${alt}.` : `No upcoming ${alt}.`}
                    type={type}
                />
            </GridItem>
        </SimpleGrid>
    );
};

export default EntryOverview;
