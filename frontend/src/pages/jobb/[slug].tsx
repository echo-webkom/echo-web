import type { ParsedUrlQuery } from 'querystring';
import { useContext } from 'react';
import { Center, Divider, Grid, GridItem, Heading, LinkBox, LinkOverlay, Spinner, VStack } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';
import Markdown from 'markdown-to-jsx';
import NextLink from 'next/link';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BiCategory } from 'react-icons/bi';
import { ImLocation } from 'react-icons/im';
import { FaUniversity } from 'react-icons/fa';
import { RiTimeLine, RiGalleryUploadLine } from 'react-icons/ri';
import Section from '@components/section';
import SEO from '@components/seo';
import type { JobAdvert } from '@api/job-advert';
import { JobAdvertAPI } from '@api/job-advert';
import { isErrorMessage } from '@utils/error';
import MapMarkdownChakra from '@utils/markdown';
import IconText from '@components/icon-text';
import { translateJobType } from '@components/job-advert-preview';
import ButtonLink from '@components/button-link';
import LanguageContext from 'language-context';

interface Props {
    jobAdvert: JobAdvert | null;
}

const JobAdvertPage = ({ jobAdvert }: Props): JSX.Element => {
    const router = useRouter();
    const isNorwegian = useContext(LanguageContext);

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {jobAdvert && !router.isFallback && (
                <>
                    <SEO title={jobAdvert.companyName} />
                    <Grid templateColumns={['repeat(1, 1fr)', null, null, 'repeat(4, 1fr)']} gap="4">
                        <GridItem colSpan={1} colStart={1} rowStart={[2, null, null, 1]} as={Section}>
                            <LinkBox mb="1em">
                                <NextLink href={jobAdvert.advertLink} passHref>
                                    <LinkOverlay isExternal>
                                        <Center>
                                            <Image
                                                src={jobAdvert.logoUrl}
                                                alt="Bedriftslogo"
                                                width={300}
                                                height={300}
                                            />
                                        </Center>
                                    </LinkOverlay>
                                </NextLink>
                            </LinkBox>
                            <VStack alignItems="left" spacing={3}>
                                <IconText
                                    icon={RiGalleryUploadLine}
                                    text={`Publisert: ${format(new Date(jobAdvert._createdAt), 'dd. MMM yyyy', {
                                        locale: isNorwegian ? nb : enUS,
                                    })}`}
                                />
                                <IconText icon={BiCategory} text={translateJobType(jobAdvert.jobType)} />
                                <IconText icon={ImLocation} text={jobAdvert.locations.join(' - ')} />
                                <IconText
                                    icon={FaUniversity}
                                    text={
                                        jobAdvert.degreeYears.length === 1
                                            ? `${String(jobAdvert.degreeYears[0])}. trinn`
                                            : `${String(
                                                  jobAdvert.degreeYears.sort().slice(0, -1).join(', '),
                                              )} og ${String(jobAdvert.degreeYears.slice(-1))} . trinn`
                                    }
                                />
                                <IconText
                                    icon={RiTimeLine}
                                    text={`Søknadsfrist: ${format(new Date(jobAdvert.deadline), 'dd. MMM yyyy', {
                                        locale: isNorwegian ? nb : enUS,
                                    })}`}
                                />
                                <Divider />
                                <ButtonLink w="100%" linkTo={jobAdvert.advertLink} isExternal>
                                    Søk her!
                                </ButtonLink>
                            </VStack>
                        </GridItem>
                        <GridItem
                            colStart={[1, null, null, 2]}
                            rowStart={[1, null, null, null]}
                            colSpan={[1, null, null, 3]}
                            rowSpan={[1, null, null, 2]}
                            minW="0"
                        >
                            <Section>
                                <Heading mb="0.2em" size="2xl">
                                    {jobAdvert.companyName}
                                </Heading>
                                <Divider mb="1em" />
                                <Markdown options={{ overrides: MapMarkdownChakra }}>{jobAdvert.body}</Markdown>
                            </Section>
                        </GridItem>
                    </Grid>
                </>
            )}
        </>
    );
};

const getStaticPaths: GetStaticPaths = async () => {
    const paths = await JobAdvertAPI.getPaths();

    return {
        paths: paths.map((slug: string) => ({
            params: {
                slug,
            },
        })),
        fallback: true,
    };
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

const getStaticProps: GetStaticProps = async (context) => {
    if (process.env.NEXT_PUBLIC_ENABLE_JOB_ADVERTS?.toLowerCase() !== 'true') {
        return {
            notFound: true,
        };
    }

    const { slug } = context.params as Params;
    const jobAdvert = await JobAdvertAPI.getJobAdvertBySlug(slug);

    if (isErrorMessage(jobAdvert)) {
        if (jobAdvert.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(jobAdvert.message);
    }

    const props: Props = {
        jobAdvert,
    };

    return { props };
};

export { getStaticPaths, getStaticProps };
export default JobAdvertPage;
