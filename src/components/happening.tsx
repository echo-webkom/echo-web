import { Center, Divider, Grid, GridItem, Heading, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import { differenceInHours, format, isAfter, isBefore, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import Image from 'next/image';
import NextLink from 'next/link';
import React from 'react';
import { Happening, HappeningType, SpotRangeCount } from '../lib/api';
import Article from './article';
import Countdown from './countdown';
import HappeningMetaInfo from './happening-meta-info';
import RegistrationForm from './registration-form';
import Section from './section';

interface Props {
    happening: Happening | null;
    backendUrl: string;
    spotRangeCounts: Array<SpotRangeCount> | null;
    date: number;
}

const HappeningUI = ({ happening, backendUrl, spotRangeCounts, date }: Props): JSX.Element => {
    if (!happening) return <></>;

    const regDate = happening.registrationDate ? parseISO(happening.registrationDate) : new Date(date);
    const happeningDate = parseISO(happening.date);

    return (
        <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
            <GridItem colSpan={1} as={Section}>
                <>
                    {happening.happeningType === HappeningType.BEDPRES && happening.companyLink && happening.logoUrl && (
                        <LinkBox mb="1em">
                            <NextLink href={happening.companyLink} passHref>
                                <LinkOverlay href={happening.companyLink} isExternal>
                                    <Center>
                                        <Image src={happening.logoUrl} alt="Bedriftslogo" width={300} height={300} />
                                    </Center>
                                </LinkOverlay>
                            </NextLink>
                        </LinkBox>
                    )}
                    <HappeningMetaInfo
                        date={parseISO(happening.date)}
                        location={happening.location}
                        locationLink={happening.locationLink}
                        title={happening.title}
                        type={happening.happeningType}
                        slug={happening.slug}
                        contactEmail={happening.contactEmail}
                        companyLink={happening.companyLink}
                        spotRangeCounts={spotRangeCounts?.length === 0 ? null : spotRangeCounts}
                        spotRangesFromCms={
                            !spotRangeCounts || spotRangeCounts.length === 0 ? happening.spotRanges : null
                        }
                    />
                    {happening.registrationDate && (
                        <>
                            <Divider my="1em" />
                            {isBefore(date, regDate) &&
                                (differenceInHours(regDate, date) > 23 ? (
                                    <Center>
                                        <Text fontSize="2xl">
                                            Åpner {format(regDate, 'dd. MMM yyyy, HH:mm', { locale: nb })}
                                        </Text>
                                    </Center>
                                ) : (
                                    <Countdown date={regDate} />
                                ))}
                            {isBefore(date, happeningDate) && isAfter(date, regDate) && (
                                <RegistrationForm
                                    happening={happening}
                                    type={happening.happeningType}
                                    backendUrl={backendUrl}
                                />
                            )}
                            {isAfter(date, happeningDate) && (
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
            </GridItem>
            <GridItem
                colStart={[1, null, null, 2]}
                rowStart={[2, null, null, 1]}
                colSpan={[1, null, null, 3]}
                rowSpan={2}
                minW="0"
            >
                <Section>
                    <Article heading={happening.title} body={happening.body} />
                </Section>
            </GridItem>
        </Grid>
    );
};

export default HappeningUI;
