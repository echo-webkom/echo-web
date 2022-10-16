import { Center, Button, TabPanel, Box } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import EntryList from './entry-list';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import LanguageContext from 'language-context';

interface Props {
    happenings: Array<Happening>;
    type: 'bedpres' | 'event';
    registrationCounts: Array<RegistrationCount>;
    previewPerPage: number;
}

const EventOverviewTab = ({ happenings, type, registrationCounts, previewPerPage }: Props) => {
    const isNorwegian = useContext(LanguageContext);
    const [page, setPage] = useState(0);
    const [visibleHappenings, setVisibleHappenings] = useState(
        happenings.slice(0, previewPerPage + page * previewPerPage),
    );

    useEffect(() => {
        setVisibleHappenings(happenings.slice(0, previewPerPage + page * previewPerPage));
    }, [page, happenings, previewPerPage]);

    return (
        <TabPanel p="0" m="0">
            <Box m="5">
                <EntryList entries={visibleHappenings} type={type} registrationCounts={registrationCounts} />
            </Box>
            <Center pt="2" gap="5" flexDir="column">
                {happenings.length > visibleHappenings.length && (
                    <Button onClick={() => setPage((prev) => prev + 1)}>{isNorwegian ? 'Vis mer' : 'Show more'}</Button>
                )}
            </Center>
        </TabPanel>
    );
};

export default EventOverviewTab;
