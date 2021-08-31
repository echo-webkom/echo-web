import { Center, Grid, GridItem, LinkBox, LinkOverlay, Link, Text, Icon, Divider, Heading } from '@chakra-ui/react';
import NextLink from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Bedpres } from '../lib/api/bedpres';
import { Event } from '../lib/api/event';
import ContentBox from './content-box';
import { CgOrganisation } from 'react-icons/cg';
import { RiTimeLine } from 'react-icons/ri';
import { MdEventSeat, MdLockOpen, MdLockOutline } from 'react-icons/md';
import { IoMdListBox } from 'react-icons/io';

import { BiCalendar } from 'react-icons/bi';
import { ImLocation } from 'react-icons/im';
import { Registration, RegistrationCount } from '../lib/api/registration';
import { format, parseISO } from 'date-fns';
import Countdown from './countdown';
import Markdown from 'markdown-to-jsx';
import MapMarkdownChakra from '../markdown';

import { HappeningType } from '../lib/api/registration';
import BedpresView from './bedpres-view';

const HappeningUI = ({
    bedpres,
    event,
    registrations,
    backendUrl,
    regCount,
    date,
}: {
    bedpres: Bedpres | null;
    event: Event | null;
    registrations: Array<Registration>;
    backendUrl: string;
    regCount: RegistrationCount;
    date: number;
}): JSX.Element => {
    const happening = bedpres || event;
    const type = bedpres ? HappeningType.BEDPRES : HappeningType.EVENT;
    const spotsTaken = regCount?.regCount || 0;
    const spotsAvailable = happening?.spots || 0;
    const waitList = regCount?.waitListCount || 0;

    return (
        <>
            <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                <GridItem colSpan={1} as={ContentBox}>
                    {happening && (
                        <>
                            {bedpres && (
                                <LinkBox mb="1em">
                                    <NextLink href={bedpres.companyLink} passHref>
                                        <LinkOverlay href={bedpres.companyLink} isExternal>
                                            <Center>
                                                <Image
                                                    src={bedpres.logoUrl}
                                                    alt="Bedriftslogo"
                                                    width={300}
                                                    height={300}
                                                />
                                            </Center>
                                        </LinkOverlay>
                                    </NextLink>
                                </LinkBox>
                            )}
                            <Grid wordBreak="break-word" templateColumns="min-content auto" gap="3" alignItems="center">
                                {bedpres && (
                                    <>
                                        <CgOrganisation size="2em" />
                                        <NextLink href={bedpres.companyLink} passHref>
                                            <Link href={bedpres.companyLink} isExternal>
                                                {
                                                    bedpres.companyLink
                                                        .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
                                                        .split('/')[0]
                                                }
                                            </Link>
                                        </NextLink>
                                    </>
                                )}
                                {spotsAvailable !== 0 && (
                                    <>
                                        <Icon as={MdEventSeat} boxSize={10} />
                                        <Text>
                                            {`${Math.min(spotsTaken, spotsAvailable)}/${spotsAvailable}`} påmeldt
                                        </Text>
                                    </>
                                )}
                                {waitList != 0 && (
                                    <>
                                        <Icon as={IoMdListBox} boxSize={10} />
                                        <Text>{`${waitList} på venteliste`}</Text>
                                    </>
                                )}
                                <Icon as={BiCalendar} boxSize={10} />
                                <Text>{format(parseISO(happening?.date), 'dd. MMM yyyy')}</Text>
                                <Icon as={RiTimeLine} boxSize={10} />
                                <Text>{format(parseISO(happening?.date), 'HH:mm')}</Text>
                                <Icon as={ImLocation} boxSize={10} />
                                <Text>{happening?.location}</Text>
                                {happening && happening.minDegreeYear === 1 && happening.maxDegreeYear === 5 && (
                                    <>
                                        <Icon as={MdLockOpen} boxSize={10} />
                                        <Text>Åpen for alle trinn</Text>
                                    </>
                                )}
                                {happening &&
                                    happening.minDegreeYear &&
                                    happening.maxDegreeYear &&
                                    (happening.minDegreeYear > 1 || happening.maxDegreeYear < 5) && (
                                        <>
                                            <Icon as={MdLockOutline} boxSize={10} />
                                            <Text>{`Bare for ${happening.minDegreeYear}. - ${happening.maxDegreeYear}. trinn`}</Text>
                                        </>
                                    )}
                            </Grid>
                            {happening.registrationTime && (
                                <>
                                    <Divider my="1em" />
                                    <Countdown happening={happening} type={type} backendUrl={backendUrl} date={date} />
                                </>
                            )}
                            <Divider my="1em" />
                            <Center>
                                <Heading size="lg">@{happening.author}</Heading>
                            </Center>
                        </>
                    )}
                </GridItem>
                <GridItem
                    colStart={[1, null, null, 2]}
                    rowStart={[2, null, null, 1]}
                    colSpan={[1, null, null, 3]}
                    rowSpan={2}
                    minW="0"
                >
                    <ContentBox>
                        <Heading mb="0.2em" size="2xl">
                            {happening?.title}
                        </Heading>
                        <Divider my=".5em" />
                        <Markdown options={{ overrides: MapMarkdownChakra }}>{happening?.body || ''}</Markdown>
                    </ContentBox>
                </GridItem>
            </Grid>
            {registrations && registrations.length > 0 && (
                <BedpresView registrations={registrations} happening={happening} />
            )}
        </>
    );
};

export default HappeningUI;
