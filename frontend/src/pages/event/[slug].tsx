import type { ParsedUrlQuery } from 'querystring';
import type { GetServerSideProps } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { parseISO, format, formatISO, differenceInMilliseconds, isBefore, isAfter, differenceInHours } from 'date-fns';
import { useTimeout, Center, Divider, Grid, GridItem, Heading, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import { nb, enUS } from 'date-fns/locale';
import Image from 'next/image';
import NextLink from 'next/link';
import { useSession } from 'next-auth/react';
import type { ErrorMessage } from '@utils/error';
import type { User } from '@api/user';
import { UserAPI } from '@api/user';
import RegistrationsList from '@components/registrations-list';
import type { Happening, HappeningInfo } from '@api/happening';
import { HappeningAPI } from '@api/happening';
import { RegistrationAPI } from '@api/registration';
import { isErrorMessage } from '@utils/error';
import type { Registration } from '@api/registration';
import ErrorBox from '@components/error-box';
import SEO from '@components/seo';
import Article from '@components/article';
import Countdown from '@components/countdown';
import HappeningMetaInfo from '@components/happening-meta-info';
import RegistrationForm from '@components/registration-form';
import Section from '@components/section';
import LanguageContext from 'language-context';
import ReactionButtons from '@components/reaction-buttons';

interface Props {
    happening: Happening | null;
    backendUrl: string;
    happeningInfo: HappeningInfo | null;
    date: number;
    error: string | null;
}

const HappeningPage = ({ happening, backendUrl, happeningInfo, date, error }: Props) => {
    const session = useSession();
    const isLoggedIn = session.data?.idToken !== undefined;
    const router = useRouter();
    const regDate = parseISO(happening?.registrationDate ?? formatISO(new Date()));
    const regDeadline = parseISO(happening?.registrationDeadline ?? formatISO(new Date()));
    const time =
        !happening ||
        differenceInMilliseconds(regDate, date) < 0 ||
        differenceInMilliseconds(regDate, date) > 172_800_000
            ? null
            : differenceInMilliseconds(regDate, date);
    const [user, setUser] = useState<User | null>(null);
    const isNorwegian = useContext(LanguageContext);
    const [regsList, setRegsList] = useState<Array<Registration>>([]);
    const [regsListError, setRegsListError] = useState<ErrorMessage | null>(null);

    useTimeout(() => {
        if (happening?.registrationDate) void router.replace(router.asPath, undefined, { scroll: false });
    }, time);

    useEffect(() => {
        const fetchUser = async () => {
            const result = await UserAPI.getUser();

            if (!isErrorMessage(result)) {
                setUser(result);
            }
        };
        void fetchUser();
    }, []);

    useEffect(() => {
        const fetchRegs = async () => {
            if (!happening) return;

            const result = await RegistrationAPI.getRegistrations(happening.slug);

            if (!isErrorMessage(result)) {
                setRegsListError(null);
                setRegsList(result);
            } else {
                setRegsListError(result);
            }
        };
        void fetchRegs();
    }, [happening]);

    return (
        <>
            {error && !happening && <ErrorBox error={error} />}
            {happening && !error && (
                <>
                    <SEO
                        title={happening.title}
                        description={`${happening.body.no.slice(0, 60)} ...`}
                        image={happening.logoUrl ?? undefined}
                    />
                    <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                        <GridItem colSpan={1} as={Section}>
                            <>
                                {happening.happeningType === 'BEDPRES' && happening.companyLink && happening.logoUrl && (
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
                                                        {isNorwegian ? `Åpner ` : `Opens `}
                                                        {format(regDate, 'dd. MMM, HH:mm', {
                                                            locale: isNorwegian ? nb : enUS,
                                                        })}
                                                    </Text>
                                                </Center>
                                            ) : (
                                                <Countdown date={regDate} />
                                            ))}
                                        {isBefore(date, parseISO(happening.date)) &&
                                            isAfter(date, regDate) &&
                                            isBefore(date, regDeadline) && (
                                                <>
                                                    <RegistrationForm
                                                        happening={happening}
                                                        type={happening.happeningType}
                                                        backendUrl={backendUrl}
                                                        regVerifyToken={happeningInfo?.regVerifyToken ?? null}
                                                        user={user}
                                                    />
                                                    {format(parseISO(happening.date), 'dd. MMM, HH:mm', {
                                                        locale: isNorwegian ? nb : enUS,
                                                    }) !==
                                                        format(regDeadline, 'dd. MMM, HH:mm', {
                                                            locale: isNorwegian ? nb : enUS,
                                                        }) && (
                                                        <Center>
                                                            <Text fontSize="md">
                                                                {isNorwegian ? 'Stenger' : 'Closes'}{' '}
                                                                {format(regDeadline, 'dd. MMM, HH:mm', {
                                                                    locale: isNorwegian ? nb : enUS,
                                                                })}
                                                            </Text>
                                                        </Center>
                                                    )}
                                                </>
                                            )}
                                        {(isAfter(date, parseISO(happening.date)) || isAfter(date, regDeadline)) && (
                                            <Center my="3" data-testid="bedpres-has-been">
                                                <Text>
                                                    {isNorwegian ? 'Påmeldingen er stengt' : 'Registration is closed'}
                                                </Text>
                                            </Center>
                                        )}
                                    </>
                                )}
                                <Divider my="1em" />
                                <Center>
                                    <Heading size="lg">@{happening.studentGroupName}</Heading>
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
                            <Section minW="100%">
                                <Article
                                    heading={happening.title}
                                    body={
                                        isNorwegian
                                            ? happening.body.no
                                            : happening.body.en ??
                                              '(No english version avalible) \n\n' + happening.body.no
                                    }
                                />
                                {isLoggedIn && (
                                    <>
                                        <Divider my="1em" />
                                        <Center flexDirection="column" gap="3">
                                            <ReactionButtons slug={happening.slug} />
                                        </Center>
                                    </>
                                )}
                            </Section>
                        </GridItem>
                    </Grid>
                    {regsList.length > 0 && (
                        <RegistrationsList
                            registrations={regsList}
                            title={happening.title}
                            error={regsListError?.message ?? null}
                        />
                    )}
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080';

    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const hiddenHappeningInfo = await HappeningAPI.getHappeningInfo(adminKey, slug, backendUrl);
    const happeningInfo = { ...hiddenHappeningInfo, regVerifyToken: null };

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
