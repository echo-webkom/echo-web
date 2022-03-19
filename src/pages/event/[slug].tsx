import { ParsedUrlQuery } from 'querystring';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { parseISO, format, formatISO, differenceInMilliseconds, isBefore, isAfter, differenceInHours } from 'date-fns';
import { useTimeout, Center, Divider, Grid, GridItem, Heading, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import { nb } from 'date-fns/locale';
import Image from 'next/image';
import NextLink from 'next/link';
import { isErrorMessage, Happening, HappeningAPI, HappeningType, HappeningInfo } from '../../lib/api';
import ErrorBox from '../../components/error-box';
import SEO from '../../components/seo';
import Article from '../../components/article';
import Countdown from '../../components/countdown';
import HappeningMetaInfo from '../../components/happening-meta-info';
import RegistrationForm from '../../components/registration-form';
import Section from '../../components/section';

interface Props {
    happening: Happening | null;
    backendUrl: string;
    happeningInfo: HappeningInfo | null;
    date: number;
    error: string | null;
}

const HappeningPage = ({ happening, backendUrl, happeningInfo, date, error }: Props): JSX.Element => {
    const router = useRouter();
    const regDate = parseISO(happening?.registrationDate ?? formatISO(new Date()));
    const time =
        !happening ||
        differenceInMilliseconds(regDate, date) < 0 ||
        differenceInMilliseconds(regDate, date) > 172_800_000
            ? null
            : differenceInMilliseconds(regDate, date);

    useTimeout(() => {
        if (happening?.registrationDate) void router.replace(router.asPath, undefined, { scroll: false });
    }, time);

    return (
        <>
            {error && !happening && <ErrorBox error={error} />}
            {happening && !error && (
                <>
                    <SEO title={happening.title} />

                    <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                        <GridItem colSpan={1} as={Section}>
                            <>
                                {happening.happeningType === HappeningType.BEDPRES &&
                                    happening.companyLink &&
                                    happening.logoUrl && (
                                        <LinkBox mb="1em">
                                            <NextLink href={happening.companyLink} passHref>
                                                <LinkOverlay href={happening.companyLink} isExternal>
                                                    <Center>
                                                        <Image
                                                            src={happening.logoUrl}
                                                            alt="Bedriftslogo"
                                                            width={300}
                                                            height={300}
                                                        />
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
                                    spotRangeCounts={
                                        happeningInfo?.spotRanges.length === 0
                                            ? null
                                            : happeningInfo?.spotRanges ?? null
                                    }
                                    spotRangesFromCms={
                                        !happeningInfo?.spotRanges || happeningInfo.spotRanges.length === 0
                                            ? happening.spotRanges
                                            : null
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
                                        {isBefore(date, parseISO(happening.date)) && isAfter(date, regDate) && (
                                            <RegistrationForm
                                                happening={happening}
                                                type={happening.happeningType}
                                                backendUrl={backendUrl}
                                                regVerifyToken={happeningInfo?.regVerifyToken ?? null}
                                            />
                                        )}
                                        {isAfter(date, parseISO(happening.date)) && (
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
                </>
            )}
        </>
    );
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as Params;
    const happening = await HappeningAPI.getHappeningBySlug(slug);
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const hiddenHappeningInfo = await HappeningAPI.getHappeningInfo(adminKey, slug, backendUrl);
    const happeningInfo = { ...hiddenHappeningInfo, regVerifyToken: undefined };

    const date = Date.now();

    if (isErrorMessage(happening)) {
        if (happening.message === '404') {
            return {
                notFound: true,
            };
        }
    } else if (happening.registrationDate && isAfter(date, parseISO(happening.registrationDate))) {
        const props: Props = {
            happening: isErrorMessage(happening) ? null : happening,
            happeningInfo: isErrorMessage(hiddenHappeningInfo) ? null : hiddenHappeningInfo,
            date,
            backendUrl,
            error: !isErrorMessage(happening) ? null : 'Det har skjedd en feil.',
        };

        return {
            props,
        };
    }

    const props: Props = {
        happening: isErrorMessage(happening) ? null : happening,
        happeningInfo: isErrorMessage(happeningInfo) ? null : happeningInfo,
        date,
        backendUrl,
        error: !isErrorMessage(happening) ? null : 'Det har skjedd en feil.',
    };

    return {
        props,
    };
};

export default HappeningPage;
