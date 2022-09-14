import { Flex, Stack, Text } from '@chakra-ui/react';
import { format, isPast } from 'date-fns';
import { nb, enGB } from 'date-fns/locale';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import { BiCalendar } from 'react-icons/bi';
import type { Happening, SpotRange } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import LanguageContext from 'language-context';

interface Props {
    event: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const HappeningKeyInfo = ({ event, registrationCounts = [] }: Props): JSX.Element => {
    const router = useRouter();
    const isNorwegian = useContext(LanguageContext);
    const isMainPage = router.pathname === '/';

    const totalReg = registrationCounts.find((regCount: RegistrationCount) => regCount.slug === event.slug)?.count ?? 0;
    const waitListCount =
        registrationCounts.find((regCount: RegistrationCount) => regCount.slug === event.slug)?.waitListCount ?? 0;
    const totalRegWithoutWaitList = totalReg - waitListCount;
    const totalSpots = event.spotRanges.map((spotRange: SpotRange) => spotRange.spots).reduce((a, b) => a + b, 0);

    return (
        <Stack textAlign="right">
            <Flex alignItems="center" justifyContent="flex-end">
                <BiCalendar />
                <Text ml="1" fontWeight="bold">
                    {format(new Date(event.date), 'dd. MMM', isNorwegian ? { locale: nb } : { locale: enGB })}
                </Text>
            </Flex>

            {event.registrationDate && isMainPage && (
                <Flex alignItems="center" justifyContent="flex-end">
                    {isPast(new Date(event.registrationDate)) ? (
                        <Text ml="1" fontSize="1rem">
                            {totalRegWithoutWaitList >= totalSpots
                                ? isNorwegian
                                    ? `Fullt`
                                    : `Full`
                                : `${totalRegWithoutWaitList} ${isNorwegian ? 'av' : 'of'} ${
                                      totalSpots === 0 ? '∞' : totalSpots
                                  }`}
                        </Text>
                    ) : (
                        <Text ml="1" fontSize="1rem">
                            {isNorwegian ? 'Påmelding' : 'Registration'}{' '}
                            <span style={{ whiteSpace: 'nowrap' }}>
                                {format(
                                    new Date(event.registrationDate),
                                    'dd. MMM yyyy',
                                    isNorwegian ? { locale: nb } : { locale: enGB },
                                )}
                            </span>
                        </Text>
                    )}
                </Flex>
            )}
        </Stack>
    );
};

export default HappeningKeyInfo;
