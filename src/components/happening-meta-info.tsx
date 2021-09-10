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

interface Props {
    date: Date;
    location: string;
    companyLink?: string;
    spotsTotal?: number;
    spotsAvailable?: number;
    spotsTaken?: number;
    spotsWaitlist?: number;
    minDegreeYear?: number;
    maxDegreeYear?: number;
}

const HappeningMetaInfo = ({
    date,
    location,
    companyLink,
    spotsTotal,
    spotsAvailable,
    spotsTaken,
    spotsWaitlist,
    minDegreeYear,
    maxDegreeYear,
}: Props): JSX.Element => {
    return (
        <VStack alignItems="left" spacing={3}>
            {companyLink && (
                <IconText
                    icon={CgOrganisation}
                    text={companyLink.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}
                    link={companyLink}
                />
            )}
            {spotsTaken && spotsAvailable && spotsTotal && spotsTotal !== 0 && (
                <IconText
                    icon={MdEventSeat}
                    text={`${Math.min(spotsTaken, spotsAvailable)}/${spotsAvailable} påmeldt`}
                />
            )}
            {spotsWaitlist && <IconText icon={IoMdListBox} text={`${spotsWaitlist} på venteliste`} />}
            <IconText icon={BiCalendar} text={format(date, 'dd. MMM yyyy')} />
            <IconText icon={RiTimeLine} text={format(date, 'HH:mm')} />
            <IconText icon={ImLocation} text={location} />
            {minDegreeYear && maxDegreeYear && minDegreeYear === 1 && maxDegreeYear === 5 && (
                <IconText icon={MdLockOpen} text="Åpen for alle trinn" />
            )}
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
