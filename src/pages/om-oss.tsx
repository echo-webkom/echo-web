import React from 'react';
import NextLink from 'next/link';
import {
    Center,
    Flex,
    Grid,
    GridItem,
    Heading,
    Icon,
    Img,
    Link,
    LinkBox,
    LinkOverlay,
    List,
    ListItem,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { GetStaticProps } from 'next';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import Layout from '../components/layout';
import hvemErVi from '../../public/static/om-oss/hvem-er-vi.md';
import instituttraadet from '../../public/static/om-oss/instituttraadet.md';
import statutter from '../../public/static/om-oss/statutter.md';
import bekk from '../../public/static/om-oss/bekk.md';
import ContentBox from '../components/content-box';
import MapMarkdownChakra from '../markdown';
import { MinuteAPI } from '../lib/api';
import { Minute } from '../lib/types';
import SEO from '../components/seo';
import StaticInfo from '../components/static-info';

const bekkLogo = '/bekk.png';

const Minutes = ({ minutes, error }: { minutes: Array<Minute> | null; error: string | null }): JSX.Element => {
    const color = useColorModeValue('blue', 'blue.400');
    return (
        <>
            <Heading mb="5">Møtereferater</Heading>
            {!minutes && error && <Text>{error}</Text>}
            {minutes && !error && minutes.length === 0 && <Text>Ingen møtereferater</Text>}
            {minutes && !error && (
                <List>
                    {minutes.map((minute: Minute) => (
                        <ListItem key={minute.date}>
                            <Flex align="center">
                                <NextLink href={minute.document} passHref>
                                    <Link href={minute.document} color={color} isExternal mr=".5em">
                                        {format(new Date(minute.date), 'dd. MMM yyyy')}
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

const OmOssPage = ({ minutes, error }: { minutes: Array<Minute> | null; error: string | null }): JSX.Element => {
    const bekkLogoFilter = useColorModeValue('invert(1)', 'invert(0)');
    const linkColor = useColorModeValue('blue', 'blue.400');

    return (
        <Layout>
            <SEO title="Om oss" />
            <Tabs isLazy orientation="vertical">
                <StaticInfo
                    tabNames={['Hvem er vi?', 'Instituttrådet', 'Statutter', 'Møtereferater', 'Bekk']}
                    tabPanels={[
                        <Markdown options={MapMarkdownChakra}>{hvemErVi}</Markdown>,
                        <Markdown options={MapMarkdownChakra}>{instituttraadet}</Markdown>,
                        <Markdown options={MapMarkdownChakra}>{statutter}</Markdown>,
                        <Minutes minutes={minutes} error={error} />,
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
                            <Markdown options={MapMarkdownChakra}>{bekk}</Markdown>
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
            </Tabs>
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const { minutes, error } = await MinuteAPI.getMinutes(0);

    return {
        props: { minutes, error },
    };
};

export default OmOssPage;
