import { VStack, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { CgOrganisation } from 'react-icons/cg';
import { ImLocation } from 'react-icons/im';
import { IoMdListBox } from 'react-icons/io';
import { GiTwoCoins } from 'react-icons/gi';
import { MdEventSeat, MdLockOutline, MdLogout, MdLockOpen } from 'react-icons/md';
import { RiTimeLine } from 'react-icons/ri';
import type { HappeningType, SpotRange, SpotRangeCount } from '@api/happening';
import IconText from '@components/icon-text';
import CalendarPopup from '@components/calendar-popup';
import useLanguage from '@hooks/use-language';
import useAuth from '@hooks/use-auth';

interface Props {
    date: Date;
    location: string;
    locationLink: string | null;
    title: string;
    type: HappeningType;
    slug: string;
    contactEmail: string | null;
    companyLink: string | null;
    spotRangeCounts: Array<SpotRangeCount> | null;
    spotRangesFromCms: Array<SpotRange> | null;
    deductiblePayment: string | null;
}

const spotsText = (spots: number) => (spots <= 0 ? '∞' : `${spots}`);

const HappeningMetaInfo = ({
    date,
    location,
    locationLink,
    title,
    type,
    slug,
    contactEmail,
    companyLink,
    spotRangeCounts,
    spotRangesFromCms,
    deductiblePayment,
}: Props): JSX.Element => {
    const isNorwegian = useLanguage();
    // If spotrangeCounts (from backend) is null, we transform spotRangesFromCms
    // to the type spotRangeCount with regCount = 0 and waitListCount = 0.
    // This means spots from CMS will be displayed if backend does not respond.
    const trueSpotRanges: Array<SpotRangeCount> =
        spotRangeCounts ??
        spotRangesFromCms?.map((sr: SpotRange) => {
            return {
                spots: sr.spots,
                minDegreeYear: sr.minDegreeYear,
                maxDegreeYear: sr.maxDegreeYear,
                regCount: 0,
                waitListCount: 0,
            };
        }) ??
        [];

    const minDegreeYear =
        trueSpotRanges.length === 0 ? 1 : Math.min(...trueSpotRanges.map((sr: SpotRange) => sr.minDegreeYear));
    const maxDegreeYear =
        trueSpotRanges.length === 0 ? 5 : Math.max(...trueSpotRanges.map((sr: SpotRange) => sr.maxDegreeYear));

    const dontShowDegreeYear = trueSpotRanges.length === 0;

    const spotsForAll = minDegreeYear === 1 && maxDegreeYear === 5 && trueSpotRanges.length === 1;

    const combinedWaitList = trueSpotRanges.map((sr) => sr.waitListCount).reduce((prev, curr) => prev + curr, 0);

    const { signedIn } = useAuth();

    return (
        <VStack alignItems="left" spacing="3" data-cy="happening-meta-info">
            {companyLink && (
                <IconText
                    icon={CgOrganisation}
                    text={companyLink.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}
                    link={companyLink}
                />
            )}
            {trueSpotRanges.map((sr: SpotRangeCount) => {
                const sameDegreeYear = sr.minDegreeYear === sr.maxDegreeYear;

                return (
                    <Flex key={`${JSON.stringify(sr)}-${slug}`}>
                        {sr.regCount === 0 && (
                            <IconText
                                key={`mdeventseat1-${sr.spots}`}
                                icon={MdEventSeat}
                                text={`${spotsText(sr.spots)} ${isNorwegian ? 'plasser' : 'spots'}`.concat(
                                    dontShowDegreeYear || spotsForAll || trueSpotRanges.length === 1
                                        ? ''
                                        : ' for '.concat(
                                              sameDegreeYear
                                                  ? `${sr.minDegreeYear}. ${isNorwegian ? 'trinn' : 'year'}`
                                                  : `${sr.minDegreeYear}. - ${sr.maxDegreeYear}. ${
                                                        isNorwegian ? 'trinn' : 'year'
                                                    }`,
                                          ),
                                )}
                            />
                        )}
                        {/* eslint-disable unicorn/prefer-spread */}
                        {sr.regCount !== 0 && (
                            <IconText
                                key={`mdeventseat2-${sr.spots}`}
                                icon={MdEventSeat}
                                text={(sr.waitListCount > 0 || sr.regCount === sr.spots
                                    ? isNorwegian
                                        ? 'Fullt'
                                        : 'Full'
                                    : `${sr.regCount}/${spotsText(sr.spots)} ${isNorwegian ? 'påmeldt' : 'registered'}`
                                ).concat(
                                    dontShowDegreeYear || spotsForAll || trueSpotRanges.length === 1
                                        ? ''
                                        : ' for '.concat(
                                              sameDegreeYear
                                                  ? `${sr.minDegreeYear}. ${isNorwegian ? 'trinn' : 'year'}`
                                                  : `${sr.minDegreeYear}. - ${sr.maxDegreeYear}. ${
                                                        isNorwegian ? 'trinn' : 'year'
                                                    }`,
                                          ),
                                )}
                            />
                        )}
                        {/* eslint-enable unicorn/prefer-spread */}
                    </Flex>
                );
            })}
            {combinedWaitList > 0 && (
                <IconText
                    icon={IoMdListBox}
                    text={`${combinedWaitList} ${isNorwegian ? 'på venteliste' : 'in waiting list'}`}
                />
            )}
            {minDegreeYear && maxDegreeYear && (minDegreeYear > 1 || maxDegreeYear < 5) ? (
                <IconText
                    icon={MdLockOutline}
                    text={`${isNorwegian ? 'Bare for' : 'Only for'}: ${
                        minDegreeYear === maxDegreeYear ? `${minDegreeYear}` : `${minDegreeYear}. - ${maxDegreeYear}`
                    }. ${isNorwegian ? 'trinn' : 'year'}`}
                />
            ) : (
                spotsForAll && (
                    <IconText icon={MdLockOpen} text={isNorwegian ? 'Åpent for alle trinn!' : 'Open for all years!'} />
                )
            )}
            <CalendarPopup title={title} date={date} type={type} slug={slug} location={location} />
            <IconText icon={RiTimeLine} text={format(date, isNorwegian ? 'HH:mm' : 'h:aaa')} />
            {locationLink ? (
                <IconText icon={ImLocation} text={location} link={locationLink} />
            ) : (
                <IconText icon={ImLocation} text={location} />
            )}
            {deductiblePayment && signedIn && (
                <IconText
                    icon={GiTwoCoins}
                    text={`${isNorwegian ? 'Egenandel' : 'Deductible'}:
                    ${deductiblePayment} kr`}
                />
            )}
            {contactEmail && (
                <IconText
                    icon={MdLogout}
                    text={isNorwegian ? 'Avmelding' : 'Unregister'}
                    link={`mailto:${contactEmail}?subject=Avmelding '${title}'`}
                />
            )}
        </VStack>
    );
};

export type { Props };
export default HappeningMetaInfo;
