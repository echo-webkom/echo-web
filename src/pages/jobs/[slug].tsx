import { ParsedUrlQuery } from 'querystring';
import { Center, Divider, Grid, GridItem, Heading, Icon, Spinner, Text } from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import Markdown from 'markdown-to-jsx';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';
import ErrorBox from '../../components/error-box';
import Section from '../../components/section';
import SEO from '../../components/seo';
import { JobAdvert, JobAdvertAPI } from '../../lib/api';
import MapMarkdownChakra from '../../markdown';

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
                            <Grid templateColumns="min-content auto" gap="3" alignItems="center">
                                <Image src={jobAdvert.logoUrl} alt="Firmalogo" width={200} height={200} />
                                <Icon as={BiCalendar} boxSize={10} />
                                <Text>{format(parseISO(jobAdvert.deadline), 'dd. MMM yyyy', { locale: nb })}</Text>
                                <Icon as={BiCalendar} boxSize={10} />
                                <Text>{jobAdvert.jobType}</Text>
                                <Icon as={BiCalendar} boxSize={10} />
                                <Text>{jobAdvert.location}</Text>
                            </Grid>
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
