import { VStack } from '@chakra-ui/react';
import { addHours, format } from 'date-fns';
import { nb } from 'date-fns/locale';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import { CgOrganisation } from 'react-icons/cg';
import { ImLocation } from 'react-icons/im';
import { IoMdListBox } from 'react-icons/io';
import { MdEventSeat, MdLockOutline, MdLogout } from 'react-icons/md';
import { RiTimeLine } from 'react-icons/ri';
import { HappeningType, SpotRange, SpotRangeCount } from '../lib/api';
import IconText from './icon-text';
import { google, outlook, office365, yahoo, ics } from 'calendar-link';

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
          }) ?? [];

    const minDegreeYear =
        trueSpotRanges.length === 0 ? 1 : Math.min(...trueSpotRanges.map((sr: SpotRange) => sr.minDegreeYear));
    const maxDegreeYear =
        trueSpotRanges.length === 0 ? 5 : Math.max(...trueSpotRanges.map((sr: SpotRange) => sr.maxDegreeYear));

    const dontShowDegreeYear =
        (minDegreeYear === 1 && maxDegreeYear === 5 && trueSpotRanges.length === 1) || trueSpotRanges.length === 1;

    const eventEndTime = addHours(date, 2);

    const event = {
        title: `${title} ${type === 'EVENT' ? 'Arrangement' : 'Bedriftspresentasjon'}`,
        description:
            `${title} ${type === 'EVENT' ? 'Arrangementet' : 'Bedriftspresentasjonen'}: ` +
            `https://echo.uib.no/${type}/${slug}`.toLowerCase(),
        start: date,
        end: eventEndTime,
        location: `${location}`,
    };

    return (
        <VStack alignItems="left" spacing={3} data-testid={`happening-meta-info-${title}`}>
            {companyLink && (
                <IconText
                    icon={CgOrganisation}
                    text={companyLink.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0]}
                    link={companyLink}
                />
            )}
            {trueSpotRanges.map((sr: SpotRangeCount) => (
                <>
                    {sr.regCount === 0 && (
                        <IconText
                            key={`mdeventseat1-${sr.spots}`}
                            icon={MdEventSeat}
                            text={`${spotsText(sr.spots)} plasser`.concat(
                                dontShowDegreeYear ? '' : ` for ${sr.minDegreeYear}. - ${sr.maxDegreeYear}. trinn`,
                            )}
                        />
                    )}
                    {sr.regCount !== 0 && (
                        <IconText
                            key={`mdeventseat2-${sr.spots}`}
                            icon={MdEventSeat}
                            text={`${sr.regCount}/${spotsText(sr.spots)} påmeldt`.concat(
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
            <IconText icon={BiCalendar} text={format(date, 'dd. MMM yyyy', { locale: nb })} link={google(event)} />
            <IconText icon={RiTimeLine} text={format(date, 'HH:mm')} />
            {locationLink ? (
                <IconText icon={ImLocation} text={location} link={locationLink} />
            ) : (
                <IconText icon={ImLocation} text={location} />
            )}
            {contactEmail && (
                <IconText
                    icon={MdLogout}
                    text="Avmelding"
                    link={`mailto:${contactEmail}?subject=Avmelding '${title}'`}
                />
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

export type { Props };
export default HappeningMetaInfo;
