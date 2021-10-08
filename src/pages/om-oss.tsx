import {
    Center,
    Flex,
    Heading,
    Icon,
    Img,
    Link,
    LinkBox,
    LinkOverlay,
    List,
    ListItem,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import NextLink from 'next/link';
import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import bekk from '../../public/static/om-oss/bekk.md';
import hvemErVi from '../../public/static/om-oss/hvem-er-vi.md';
import instituttraadet from '../../public/static/om-oss/instituttraadet.md';
import statutter from '../../public/static/om-oss/statutter.md';
import ErrorBox from '../components/error-box';
import Layout from '../components/layout';
import SEO from '../components/seo';
import StaticInfo from '../components/static-info';
import StudentGroupSection from '../components/student-group-section';
import { Minute, MinuteAPI } from '../lib/api/minute';
import { StudentGroup, StudentGroupAPI } from '../lib/api/student-group';
import MapMarkdownChakra from '../markdown';

const bekkLogo = '/bekk.png';

const Minutes = ({ minutes, error }: { minutes: Array<Minute> | null; error: string | null }): JSX.Element => {
    const color = useColorModeValue('blue', 'blue.400');
    return (
        <>
            <Heading mb="5">Møtereferater</Heading>
            {!minutes && error && <ErrorBox error={error} />}
            {minutes && !error && minutes.length === 0 && <Text>Ingen møtereferater</Text>}
            {minutes && !error && (
                <List>
                    {minutes.map((minute: Minute) => (
                        <ListItem key={minute.date}>
                            <Flex align="center">
                                <NextLink href={minute.documentUrl} passHref>
                                    <Link href={minute.documentUrl} color={color} isExternal mr=".5em">
                                        {format(new Date(minute.date), 'dd. MMM yyyy', { locale: nb })}
                                    </Link>
                                </NextLink>
                                <Icon as={FaExternalLinkAlt} />
                            </Flex>
                        </ListItem>
                    ))}
                </List>
            )}
        </>
    );
};

const OmOssPage = ({
    boards,
    boardsError,
    minutes,
    error,
}: {
    boards: Array<StudentGroup>;
    boardsError: string;
    minutes: Array<Minute> | null;
    error: string | null;
}): JSX.Element => {
    const bekkLogoFilter = useColorModeValue('invert(1)', 'invert(0)');
    const linkColor = useColorModeValue('blue', 'blue.400');

    return (
        <Layout>
            <SEO title="Om oss" />
            <StaticInfo
                tabNames={['Hvem er vi?', 'Instituttrådet', 'Statutter', 'Møtereferater', 'Bekk']}
                tabPanels={[
                    <>
                        <Markdown options={{ overrides: MapMarkdownChakra }}>{hvemErVi}</Markdown>
                        <StudentGroupSection studentGroups={boards.reverse()} error={boardsError} groupType="styrer" />
                    </>,
                    <Markdown key="instituttraadet" options={{ overrides: MapMarkdownChakra }}>
                        {instituttraadet}
                    </Markdown>,
                    <Markdown key="statutter" options={{ overrides: MapMarkdownChakra }}>
                        {statutter}
                    </Markdown>,
                    <Minutes key="minutes" minutes={minutes} error={error} />,
                    <>
                        <Center>
                            <LinkBox>
                                <NextLink href="https://bekk.no" passHref>
                                    <LinkOverlay isExternal>
                                        <Img src={bekkLogo} filter={bekkLogoFilter} />
                                    </LinkOverlay>
                                </NextLink>
                            </LinkBox>
                        </Center>
                        <Markdown options={{ overrides: MapMarkdownChakra }}>{bekk}</Markdown>
                        <Text mt="2em">
                            Offentlig hovedsamarbeidspartnerkontrakt finner du{' '}
                            <NextLink
                                href="https://assets.ctfassets.net/7ygn1zpoiz5r/2thjF1h2psjpGvPYUBtIfo/b02e65f0520bee931a935e3617ad31c9/Offentlig-avtale-2020_2022.pdf"
                                passHref
                            >
                                <Link
                                    color={linkColor}
                                    href="https://assets.ctfassets.net/7ygn1zpoiz5r/2thjF1h2psjpGvPYUBtIfo/b02e65f0520bee931a935e3617ad31c9/Offentlig-avtale-2020_2022.pdf"
                                    isExternal
                                >
                                    her.
                                </Link>
                            </NextLink>
                        </Text>
                    </>,
                ]}
            />
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { minutes, error } = await MinuteAPI.getMinutes();
    const boards = await StudentGroupAPI.getStudentGroupsByType('board');

    return {
        props: { boards: boards.studentGroups, boardsError: boards.error, minutes, error },
    };
};

export default OmOssPage;
