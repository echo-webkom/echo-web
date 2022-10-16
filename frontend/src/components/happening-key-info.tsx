import { Flex, Stack, Text } from '@chakra-ui/react';
import { format, isToday, isPast } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';
import { useContext } from 'react';
import { BiCalendar } from 'react-icons/bi';
import type { Happening, SpotRange } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import LanguageContext from 'language-context';

interface Props {
    event: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const HappeningKeyInfo = ({ event, registrationCounts = [] }: Props): JSX.Element => {
    const isNorwegian = useContext(LanguageContext);

    const totalReg = registrationCounts.find((regCount: RegistrationCount) => regCount.slug === event.slug)?.count ?? 0;
    const waitListCount =
        registrationCounts.find((regCount: RegistrationCount) => regCount.slug === event.slug)?.waitListCount ?? 0;
    const totalRegWithoutWaitList = totalReg - waitListCount;
    const totalSpots = event.spotRanges.map((spotRange: SpotRange) => spotRange.spots).reduce((a, b) => a + b, 0);

    return (
        <Stack textAlign="right">
            <Flex alignItems="center" justifyContent="flex-end">
                <BiCalendar />
                {isToday(new Date(event.date)) ? (
                    <>
                        <Text ml="1" fontWeight="bold">
                            {isNorwegian ? `I dag ` : `Today `}
                        </Text>
                        <Text ml="1" fontSize="1rem">
                            {format(new Date(event.date), isNorwegian ? 'HH:mm' : 'h:aaa')}
                        </Text>
                    </>
                ) : (
                    format(new Date(event.date), 'dd. MMM', { locale: isNorwegian ? nb : enUS })
                )}
            </Flex>

            {event.registrationDate && (
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
                            {isToday(new Date(event.registrationDate)) ? (
                                isNorwegian ? (
                                    `Påmelding i dag`
                                ) : (
                                    `Registration today`
                                )
                            ) : (
                                <span style={{ whiteSpace: 'nowrap' }}>
                                    {isNorwegian ? `Påmelding ` : ` Registration `}
                                    {format(new Date(event.registrationDate), 'dd. MMM yyyy', {
                                        locale: isNorwegian ? nb : enUS,
                                    })}
                                </span>
                            )}
                        </Text>
                    )}
                </Flex>
            )}
        </Stack>
    );
};

export default HappeningKeyInfo;
