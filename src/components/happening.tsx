import { Center, Divider, Grid, GridItem, Heading, LinkBox, LinkOverlay, Text, VStack } from '@chakra-ui/react';
import { differenceInHours, format, isAfter, isBefore, parseISO } from 'date-fns';
import Markdown from 'markdown-to-jsx';
import Image from 'next/image';
import NextLink from 'next/link';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import { CgOrganisation } from 'react-icons/cg';
import { ImLocation } from 'react-icons/im';
import { IoMdListBox } from 'react-icons/io';
import { MdEventSeat, MdLockOpen, MdLockOutline } from 'react-icons/md';
import { RiTimeLine } from 'react-icons/ri';
import { Bedpres } from '../lib/api/bedpres';
import { Event } from '../lib/api/event';
import { HappeningType, RegistrationCount } from '../lib/api/registration';
import MapMarkdownChakra from '../markdown';
import Countdown from './countdown';
import IconText from './icon-text';
import RegistrationForm from './registration-form';
import Section from './section';

const HappeningUI = ({
    bedpres,
    event,
    backendUrl,
    regCount,
    date,
}: {
    bedpres: Bedpres | null;
    event: Event | null;
    backendUrl: string;
    regCount: RegistrationCount;
    date: number;
}): JSX.Element => {
    const happening = bedpres || event;
    const type = bedpres ? HappeningType.BEDPRES : HappeningType.EVENT;
    const spotsTaken = regCount?.regCount || 0;
    const spotsAvailable = happening?.spots || 0;
    const waitList = regCount?.waitListCount || 0;

    const regDate = happening?.registrationTime ? parseISO(happening.registrationTime) : new Date(date);
    const eventDate = happening?.date ? parseISO(happening.date) : new Date(date);

    return (
        <>
            <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                <GridItem colSpan={1} as={Section}>
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
                            <VStack alignItems="left" spacing={3}>
                                {bedpres && (
                                    <IconText
                                        icon={CgOrganisation}
                                        text={
                                            bedpres.companyLink
                                                .replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
                                                .split('/')[0]
                                        }
                                        link={bedpres.companyLink}
                                    />
                                )}
                                {spotsAvailable !== 0 && (
                                    <IconText
                                        icon={MdEventSeat}
                                        text={`${Math.min(spotsTaken, spotsAvailable)}/${spotsAvailable} påmeldt`}
                                    />
                                )}
                                {waitList != 0 && <IconText icon={IoMdListBox} text={`${waitList} på venteliste`} />}
                                <IconText icon={BiCalendar} text={format(parseISO(happening.date), 'dd. MMM yyyy')} />
                                <IconText icon={RiTimeLine} text={format(parseISO(happening.date), 'HH:mm')} />
                                <IconText icon={ImLocation} text={happening.location} />
                                {happening.minDegreeYear === 1 && happening.maxDegreeYear === 5 && (
                                    <IconText icon={MdLockOpen} text="Åpen for alle trinn" />
                                )}
                                {happening.minDegreeYear &&
                                    happening.maxDegreeYear &&
                                    (happening.minDegreeYear > 1 || happening.maxDegreeYear < 5) && (
                                        <IconText
                                            icon={MdLockOutline}
                                            text={`Bare for ${
                                                happening.minDegreeYear === happening.maxDegreeYear
                                                    ? `${happening.minDegreeYear}`
                                                    : `${happening.minDegreeYear}. - ${happening.maxDegreeYear}`
                                            }. trinn`}
                                        />
                                    )}
                            </VStack>
                            {happening.registrationTime && (
                                <>
                                    <Divider my="1em" />
                                    {isBefore(date, regDate) &&
                                        (differenceInHours(regDate, date) > 23 ? (
                                            <Center>
                                                <Text fontSize="2xl">
                                                    Åpner {format(regDate, 'dd. MMM yyyy, HH:mm')}
                                                </Text>
                                            </Center>
                                        ) : (
                                            <Countdown date={regDate} />
                                        ))}
                                    {isBefore(date, eventDate) && isAfter(date, regDate) && (
                                        <RegistrationForm happening={happening} type={type} backendUrl={backendUrl} />
                                    )}
                                    {isAfter(date, eventDate) && (
                                        <Center my="3" data-testid="bedpres-has-been">
                                            <Text>Påmeldingen er stengt.</Text>
                                        </Center>
                                    )}
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
                    <Section>
                        <Heading mb="0.2em" size="2xl">
                            {happening?.title}
                        </Heading>
                        <Divider my=".5em" />
                        <Markdown options={{ overrides: MapMarkdownChakra }}>{happening?.body || ''}</Markdown>
                    </Section>
                </GridItem>
            </Grid>
        </>
    );
};

export default HappeningUI;
