import { ParsedUrlQuery } from 'querystring';
import { Center, Divider, Grid, GridItem, Heading, LinkBox, LinkOverlay, Spinner, VStack } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Markdown from 'markdown-to-jsx';
import NextLink from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { BiCategory } from 'react-icons/bi';
import { ImLocation } from 'react-icons/im';
import { FaUniversity } from 'react-icons/fa';
import { RiTimeLine } from 'react-icons/ri';
import ErrorBox from '../../components/error-box';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { JobAdvert, JobAdvertAPI } from '../../lib/api';
import MapMarkdownChakra from '../../markdown';
import IconText from '../../components/icon-text';
import { translateJobType } from '../../components/job-advert-preview';
import ButtonLink from '../../components/button-link';

interface Props {
    jobAdvert: JobAdvert | null;
    error: string | null;
}

const JobAdvertPage = ({ jobAdvert, error }: Props): JSX.Element => {
    const router = useRouter();

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {error && !router.isFallback && !jobAdvert && <ErrorBox error={error} />}
            {jobAdvert && !router.isFallback && !error && (
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
                                <IconText icon={BiCategory} text={translateJobType(jobAdvert.jobType)} />
                                <IconText icon={ImLocation} text={jobAdvert.locations.join(' - ')} />
                                <IconText
                                    icon={FaUniversity}
                                    text={`${Math.min(...jobAdvert.degreeYears)}. - ${Math.max(
                                        ...jobAdvert.degreeYears,
                                    )}. trinn`}
                                />
                                <IconText
                                    icon={RiTimeLine}
                                    text={`Søknadsfrist: ${format(new Date(jobAdvert.deadline), 'dd. MMM yyyy', {
                                        locale: nb,
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
    const { slug } = context.params as Params;
    const { jobAdvert, error } = await JobAdvertAPI.getJobAdvertBySlug(slug);

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    const props: Props = {
        jobAdvert,
        error,
    };

    return { props };
};

export { getStaticPaths, getStaticProps };
export default JobAdvertPage;
