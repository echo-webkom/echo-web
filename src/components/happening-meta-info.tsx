import { VStack } from '@chakra-ui/react';
import { format } from 'date-fns';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import { CgOrganisation } from 'react-icons/cg';
import { ImLocation } from 'react-icons/im';
import { IoMdListBox } from 'react-icons/io';
import { MdEventSeat, MdLockOpen, MdLockOutline } from 'react-icons/md';
import { RiTimeLine } from 'react-icons/ri';
import IconText from './icon-text';

import { SpotRangeCount } from '../lib/api/registration';

interface Props {
    date: Date;
    location: string;
    companyLink?: string;
    spotRangeCounts: Array<SpotRangeCount>;
}

const HappeningMetaInfo = ({ date, location, companyLink, spotRangeCounts }: Props): JSX.Element => {
    const absMaxDegreeYear = Math.max(...(spotRangeCounts?.map((sr: SpotRangeCount) => sr.maxDegreeYear) || [1]));
    const absMinDegreeYear = Math.min(...(spotRangeCounts?.map((sr: SpotRangeCount) => sr.minDegreeYear) || [5]));
    const openForAll = absMinDegreeYear === 1 && absMaxDegreeYear === 5;

    return (
        <VStack alignItems="left" spacing={3}>
            {companyLink && (
                <IconText
                    icon={CgOrganisation}
                    text={companyLink.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}
                    link={companyLink}
                />
            )}
            {spotRangeCounts &&
                spotRangeCounts.map((sr: SpotRangeCount) => (
                    <>
                        {sr.regCount === 0 && sr.spots !== 0 && (
                            <IconText
                                key={`mdeventseat1-${sr.spots}`}
                                icon={MdEventSeat}
                                text={`${sr.spots} plasser for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`}
                            />
                        )}
                        {sr.regCount !== 0 && (
                            <IconText
                                key={`mdeventseat2-${sr.spots}`}
                                icon={MdEventSeat}
                                text={`${Math.min(sr.regCount, sr.spots)}/${sr.spots} påmeldt`.concat(
                                    openForAll && spotRangeCounts.length === 1
                                        ? ''
                                        : ` for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`,
                                )}
                            />
                        )}
                        {sr.waitListCount > 0 && (
                            <IconText
                                key={`iomdlistbox-${sr.waitListCount}`}
                                icon={IoMdListBox}
                                text={`${sr.waitListCount} på venteliste`.concat(
                                    openForAll && spotRangeCounts.length === 1
                                        ? ''
                                        : ` for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`,
                                )}
                            />
                        )}
                    </>
                ))}
            <IconText icon={BiCalendar} text={format(date, 'dd. MMM yyyy')} />
            <IconText icon={RiTimeLine} text={format(date, 'HH:mm')} />
            <IconText icon={ImLocation} text={location} />
            {absMinDegreeYear === 1 && absMaxDegreeYear === 5 && (
                <IconText
                    key={`openforall-${absMinDegreeYear}-${absMaxDegreeYear}`}
                    icon={MdLockOpen}
                    text="Åpen for alle trinn"
                />
            )}
            {(absMinDegreeYear > 1 || absMaxDegreeYear < 5) && (
                <IconText
                    key={`openforonly-${absMinDegreeYear}-to-${absMaxDegreeYear}`}
                    icon={MdLockOutline}
                    text={`Bare for ${
                        absMinDegreeYear === absMaxDegreeYear
                            ? `${absMinDegreeYear}`
                            : `${absMinDegreeYear}. - ${absMaxDegreeYear}`
                    }. trinn`}
                />
            )}
        </VStack>
    );
};

export default HappeningMetaInfo;
