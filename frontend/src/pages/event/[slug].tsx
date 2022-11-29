import type { ParsedUrlQuery } from 'querystring';
import type { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { parseISO, format, formatISO, isBefore, isAfter, isFuture } from 'date-fns';
import { Center, Divider, Grid, GridItem, Heading, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import { nb, enUS } from 'date-fns/locale';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import NextLink from 'next/link';
import type { ErrorMessage } from '@utils/error';
import useUser from '@hooks/use-user';
import RegistrationsList from '@components/registrations-list';
import type { Happening, HappeningInfo } from '@api/happening';
import { HappeningAPI } from '@api/happening';
import { RegistrationAPI } from '@api/registration';
import { isErrorMessage } from '@utils/error';
import type { Registration } from '@api/registration';
import ErrorBox from '@components/error-box';
import SEO from '@components/seo';
import Article from '@components/article';
import HappeningMetaInfo from '@components/happening-meta-info';
import RegistrationForm from '@components/registration-form';
import Section from '@components/section';
import ReactionButtons from '@components/reaction-buttons';
import useLanguage from '@hooks/use-language';

interface Props {
    happening: Happening | null;
    happeningInfo: HappeningInfo | null;
    date: number;
    error: string | null;
}

const HappeningPage = ({ happening, happeningInfo, date, error }: Props): JSX.Element => {
    const { data } = useSession();
    const regDate = parseISO(happening?.registrationDate ?? formatISO(new Date()));
    const regDeadline = parseISO(happening?.registrationDeadline ?? formatISO(new Date()));
    const isNorwegian = useLanguage();
    const { signedIn } = useUser();
    const [regsList, setRegsList] = useState<Array<Registration>>([]);
    const [regsListError, setRegsListError] = useState<ErrorMessage | null>(null);

    useEffect(() => {
        const fetchRegs = async () => {
            if (!happening || !data?.idToken) return;
            const result = await RegistrationAPI.getRegistrations(happening.slug, data.idToken);

            if (isErrorMessage(result)) {
                setRegsListError(result);
            } else {
                setRegsListError(null);
                setRegsList(result);
            }
        };
        void fetchRegs();
    }, [happening, data?.idToken]);

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
                                {happening.happeningType === 'BEDPRES' &&
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
                                {(happening.registrationDate || happening.studentGroupRegistrationDate) && (
                                    <>
                                        <Divider my="1em" />
                                        {isFuture(regDeadline) && (
                                            <RegistrationForm happening={happening} type={happening.happeningType} />
                                        )}
                                        {isBefore(date, parseISO(happening.date)) &&
                                            isAfter(date, regDate) &&
                                            isBefore(date, regDeadline) && (
                                                <>
                                                    {signedIn && (
                                                        <Center mt="1rem">
                                                            <Text fontSize="md">
                                                                {isNorwegian
                                                                    ? 'Påmelding stenger'
                                                                    : 'Registration closes'}{' '}
                                                                {format(regDeadline, 'dd. MMM HH:mm', {
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
                                <Center>
                                    <ReactionButtons slug={happening.slug} />
                                </Center>
                            </Section>
                        </GridItem>
                    </Grid>
                    {regsList.length > 0 && (
                        <RegistrationsList
                            registrations={regsList}
                            error={regsListError?.message ?? null}
                            title={happening.title}
                            studentGroups={happening.studentGroups}
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

    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) throw new Error('No ADMIN_KEY defined.');

    const happeningInfo = await HappeningAPI.getHappeningInfo(adminKey, slug);

    const date = Date.now();

    if (isErrorMessage(happening) && happening.message === '404') {
        return {
            notFound: true,
        };
    }

    const props: Props = {
        happening: isErrorMessage(happening) ? null : happening,
        happeningInfo: isErrorMessage(happeningInfo) ? null : happeningInfo,
        date,
        error: isErrorMessage(happening) ? 'Det har skjedd en feil.' : null,
    };

    return {
        props,
    };
};

export default HappeningPage;
