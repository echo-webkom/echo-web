import { VStack } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import { CgOrganisation } from 'react-icons/cg';
import { ImLocation } from 'react-icons/im';
import { IoMdListBox } from 'react-icons/io';
import { MdEventSeat, MdLockOpen, MdLockOutline } from 'react-icons/md';
import { RiTimeLine } from 'react-icons/ri';
import IconText from './icon-text';

import { SpotRangeCount } from '../lib/api/registration';
import { Bedpres } from '../lib/api/bedpres';

interface Props {
    date: Date;
    location: string;
    companyLink?: string;
    bedpres: Bedpres | null;
    spotRangeCounts: Array<SpotRangeCount>;
}

const HappeningMetaInfo = ({ date, location, companyLink, bedpres, spotRangeCounts }: Props): JSX.Element => {
    const absMinDegreeYear = Math.min(...(spotRangeCounts?.map((sr: SpotRangeCount) => sr?.minDegreeYear || 1) || [1]));
    const absMaxDegreeYear = Math.max(...(spotRangeCounts?.map((sr: SpotRangeCount) => sr?.maxDegreeYear || 5) || [5]));
    const dontShowDegreeYear =
        (absMinDegreeYear === 1 && absMaxDegreeYear === 5 && spotRangeCounts?.length === 1) ||
        spotRangeCounts?.length === 1;

    return (
        <VStack alignItems="left" spacing={3}>
            {companyLink && (
                <IconText
                    icon={CgOrganisation}
                    text={companyLink.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}
                    link={companyLink}
                />
            )}
            {spotRangeCounts?.map((sr: SpotRangeCount) => (
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
            {absMinDegreeYear === 1 && absMaxDegreeYear === 5 && bedpres?.minDegreeYear && bedpres?.maxDegreeYear && (
                <IconText icon={MdLockOpen} text="Åpen for alle trinn" />
            )}
            {(absMinDegreeYear > 1 || absMaxDegreeYear < 5) && (
                <IconText
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
