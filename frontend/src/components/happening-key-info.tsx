import { Flex, Stack, Text } from '@chakra-ui/react';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';
import { BiCalendar } from 'react-icons/bi';
import type { Happening, SpotRange } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import useLanguage from '@hooks/use-language';
import hasOverlap from '@utils/has-overlap';
import useAuth from '@hooks/use-auth';
import parseISOOrNull from '@utils/parse-iso-or-null';

interface Props {
    event: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const HappeningKeyInfo = ({ event, registrationCounts = [] }: Props): JSX.Element => {
    const isNorwegian = useLanguage();
    const { user } = useAuth();

    const totalRegs =
        registrationCounts.find((regCount: RegistrationCount) => regCount.slug === event.slug)?.count ?? 0;
    const totalSpots = event.spotRanges.map((spotRange: SpotRange) => spotRange.spots).reduce((a, b) => a + b, 0);

    const userIsEligibleForEarlyReg = hasOverlap(event.studentGroups, user?.memberships);
    const registrationDate = parseISOOrNull(
        userIsEligibleForEarlyReg ? event.studentGroupRegistrationDate : event.registrationDate,
    );

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
                            {format(parseISO(event.date), isNorwegian ? 'HH:mm' : 'h:aaa')}
                        </Text>
                    </>
                ) : (
                    format(new Date(event.date), 'dd. MMM', { locale: isNorwegian ? nb : enUS })
                )}
            </Flex>

            {registrationDate && (
                <Flex alignItems="center" justifyContent="flex-end">
                    {isPast(registrationDate) ? (
                        <Text ml="1" fontSize="1rem">
                            {totalRegs >= totalSpots && totalSpots !== 0
                                ? isNorwegian
                                    ? `Fullt`
                                    : `Full`
                                : `${totalRegs} ${isNorwegian ? 'av' : 'of'} ${totalSpots === 0 ? '∞' : totalSpots}`}
                        </Text>
                    ) : (
                        <Text ml="1" fontSize="1rem">
                            {isToday(registrationDate) ? (
                                isNorwegian ? (
                                    `Påmelding i dag`
                                ) : (
                                    `Registration today`
                                )
                            ) : (
                                <span style={{ whiteSpace: 'nowrap' }}>
                                    {isNorwegian ? `Påmelding ` : ` Registration `}
                                    {format(registrationDate, 'dd. MMM yyyy', {
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
