import { Center, Img, Link, LinkBox, LinkOverlay, Text, useColorModeValue } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import NextLink from 'next/link';
import React from 'react';
import bekk from '../../public/static/om-oss/bekk.md';
import hvemErVi from '../../public/static/om-oss/hvem-er-vi.md';
import instituttraadet from '../../public/static/om-oss/instituttraadet.md';
import statutter from '../../public/static/om-oss/statutter.md';
import MinuteList from '../components/minute-list';
import SEO from '../components/seo';
import InfoPanels from '../components/info-panels';
import StudentGroupSection from '../components/student-group-section';
import { isErrorMessage, Minute, MinuteAPI, StudentGroup, StudentGroupAPI } from '../lib/api';
import MapMarkdownChakra from '../markdown';

const bekkLogo = '/bekk.png';

const OmOssPage = ({ boards, minutes }: { boards: Array<StudentGroup>; minutes: Array<Minute> }): JSX.Element => {
    const bekkLogoFilter = useColorModeValue('invert(1)', 'invert(0)');
    const linkColor = useColorModeValue('blue', 'blue.400');

    return (
        <>
            <SEO title="Om oss" />
            <InfoPanels
                tabNames={['Hvem er vi?', 'Instituttrådet', 'Statutter', 'Møtereferater', 'Bekk']}
                tabPanels={[
                    <>
                        <Markdown options={{ overrides: MapMarkdownChakra }}>{hvemErVi}</Markdown>
                        <StudentGroupSection studentGroups={boards} groupType="styrer" groupDefinition="" />
                    </>,
                    <Markdown key="instituttraadet" options={{ overrides: MapMarkdownChakra }}>
                        {instituttraadet}
                    </Markdown>,
                    <Markdown key="statutter" options={{ overrides: MapMarkdownChakra }}>
                        {statutter}
                    </Markdown>,
                    <MinuteList key="minutes" minutes={minutes} />,
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
        </>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const minutes = await MinuteAPI.getMinutes();
    const boards = await StudentGroupAPI.getStudentGroupsByType('board');

    if (isErrorMessage(minutes)) throw new Error(minutes.message);
    if (isErrorMessage(boards)) throw new Error(boards.message);

    return {
        props: { boards: boards.reverse(), minutes },
    };
};

export default OmOssPage;
