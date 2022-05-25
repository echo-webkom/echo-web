import { Box, Heading } from '@chakra-ui/react';
import { isFuture, isPast } from 'date-fns';
import { useState } from 'react';
import { Happening, RegistrationCount } from '../lib/api';
import AnimatedTabs from './animated-tabs';
import EntryBox from './entry-box';

interface Props {
    events: Array<Happening>;
    title: string;
    type: 'bedpres' | 'event';
    registrationCounts: Array<RegistrationCount>;
}

const EventOverview = ({ title, events, type, registrationCounts }: Props) => {
    const [time, setTime] = useState('upcoming');

    const upcoming = events.filter((entry: Happening) => isFuture(new Date(entry.date)));
    const past = events.filter((entry: Happening) => isPast(new Date(entry.date))).reverse();

    return (
        <Box>
            <Heading>{title}</Heading>
            <AnimatedTabs
                tabs={[
                    { title: 'Tidligere', value: 'past', tabBody },
                    { title: 'Kommende', value: 'upcoming', tabBody },
                ]}
                state={time}
                setState={setTime}
            />
            <EntryBox
                entries={time === 'upcoming' ? upcoming : past}
                type={type}
                altText={type === 'bedpres' ? 'Ingen flere bedriftpresentasjoner :(' : 'Ingen flere arrangement :('}
                registrationCounts={registrationCounts}
            />
        </Box>
    );
};

const tabBody = (
    <ul style={{ listStyle: 'none', margin: '16px 24px', padding: 0 }}>
        {new Array(3).fill(0).map((_, i) => (
            <li key={i} />
        ))}
    </ul>
);

export default EventOverview;
