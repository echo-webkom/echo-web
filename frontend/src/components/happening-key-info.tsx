import { Flex, Stack, Text } from '@chakra-ui/react';
import { format, isPast } from 'date-fns';
import { nb } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { BiCalendar } from 'react-icons/bi';
import { Happening, RegistrationCount, SpotRange } from '../lib/api';

interface Props {
    event: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const HappeningKeyInfo = ({ event, registrationCounts = [] }: Props): JSX.Element => {
    const router = useRouter();
    const isMainPage = router.pathname === '/';

    const totalReg = registrationCounts.find((regCount: RegistrationCount) => regCount.slug === event.slug)?.count ?? 0;
    const totalSpots = event.spotRanges.map((spotRange: SpotRange) => spotRange.spots).reduce((a, b) => a + b, 0);

    return (
        <Stack textAlign="right">
            <Flex alignItems="center" justifyContent="flex-end">
                <BiCalendar />
                <Text ml="1" fontWeight="bold">
                    {format(new Date(event.date), 'dd. MMM', { locale: nb })}
                </Text>
            </Flex>

            {event.registrationDate && isMainPage && (
                <Flex alignItems="center" justifyContent="flex-end">
                    {isPast(new Date(event.registrationDate)) ? (
                        <Text ml="1" fontSize="1rem">
                            {totalReg >= totalSpots ? `Fullt` : `${totalReg} av ${totalSpots === 0 ? '∞' : totalSpots}`}
                        </Text>
                    ) : (
                        <Text ml="1" fontSize="1rem">
                            Påmelding{' '}
                            <span style={{ whiteSpace: 'nowrap' }}>
                                {format(new Date(event.registrationDate), 'dd. MMM yyyy', { locale: nb })}
                            </span>
                        </Text>
                    )}
                </Flex>
            )}
        </Stack>
    );
};

export default HappeningKeyInfo;
