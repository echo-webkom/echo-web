import { VStack } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import { CgOrganisation } from 'react-icons/cg';
import { ImLocation } from 'react-icons/im';
import { IoMdListBox } from 'react-icons/io';
import { MdEventSeat, MdLockOutline, MdLogout } from 'react-icons/md';
import { RiTimeLine } from 'react-icons/ri';
import IconText from './icon-text';
import { SpotRange, SpotRangeCount } from '../lib/api';

interface Props {
    date: Date;
    location: string;
    contactEmail: string | null;
    companyLink: string | null;
    spotRangeCounts: Array<SpotRangeCount> | null;
    spotRangesFromCms: Array<SpotRange> | null;
}

const HappeningMetaInfo = ({
    date,
    location,
    contactEmail,
    companyLink,
    spotRangeCounts,
    spotRangesFromCms,
}: Props): JSX.Element => {
    // If spotrangeCounts (from backend) is null, we transform spotRangesFromCms
    // to the type spotRangeCount with regCount = 0 and waitListCount = 0.
    // This means spots from CMS will be displayed if backend does not respond.
    const trueSpotRanges: Array<SpotRangeCount> = spotRangeCounts
        ? spotRangeCounts
        : spotRangesFromCms?.map((sr: SpotRange) => {
              return {
                  spots: sr.spots,
                  minDegreeYear: sr.minDegreeYear,
                  maxDegreeYear: sr.maxDegreeYear,
                  regCount: 0,
                  waitListCount: 0,
              };
          }) || [];

    const minDegreeYear =
        trueSpotRanges.length === 0 ? 1 : Math.min(...trueSpotRanges.map((sr: SpotRange) => sr.minDegreeYear));
    const maxDegreeYear =
        trueSpotRanges.length === 0 ? 5 : Math.max(...trueSpotRanges.map((sr: SpotRange) => sr.maxDegreeYear));

    const dontShowDegreeYear =
        (minDegreeYear === 1 && maxDegreeYear === 5 && trueSpotRanges.length === 1) || trueSpotRanges.length === 1;

    return (
        <VStack alignItems="left" spacing={3}>
            {companyLink && (
                <IconText
                    icon={CgOrganisation}
                    text={companyLink.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}
                    link={companyLink}
                />
            )}
            {trueSpotRanges.map((sr: SpotRangeCount) => (
                <>
                    {sr.regCount === 0 && sr.spots !== 0 && (
                        <IconText
                            key={`mdeventseat1-${sr.spots}`}
                            icon={MdEventSeat}
                            text={`${sr.spots} plasser`.concat(
                                dontShowDegreeYear ? '' : `for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`,
                            )}
                        />
                    )}
                    {sr.regCount !== 0 && (
                        <IconText
                            key={`mdeventseat2-${sr.spots}`}
                            icon={MdEventSeat}
                            text={`${Math.min(sr.regCount, sr.spots)}/${sr.spots} påmeldt`.concat(
                                dontShowDegreeYear ? '' : ` for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`,
                            )}
                        />
                    )}
                    {sr.waitListCount > 0 && (
                        <IconText
                            key={`iomdlistbox-${sr.waitListCount}`}
                            icon={IoMdListBox}
                            text={`${sr.waitListCount} på venteliste`.concat(
                                dontShowDegreeYear ? '' : ` for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`,
                            )}
                        />
                    )}
                </>
            ))}
            <IconText icon={BiCalendar} text={format(date, 'dd. MMM yyyy', { locale: nb })} />
            <IconText icon={RiTimeLine} text={format(date, 'HH:mm')} />
            <IconText icon={ImLocation} text={location} />
            {contactEmail && <IconText icon={MdLogout} text={contactEmail} link={`mailto:${contactEmail}`} />}
            {minDegreeYear && maxDegreeYear && (minDegreeYear > 1 || maxDegreeYear < 5) && (
                <IconText
                    icon={MdLockOutline}
                    text={`Bare for ${
                        minDegreeYear === maxDegreeYear ? `${minDegreeYear}` : `${minDegreeYear}. - ${maxDegreeYear}`
                    }. trinn`}
                />
            )}
        </VStack>
    );
};

export default HappeningMetaInfo;
