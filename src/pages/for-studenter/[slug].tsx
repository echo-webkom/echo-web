import { ParsedUrlQuery } from 'querystring';
import { Center, Divider, Heading, Spinner, Wrap, WrapItem } from '@chakra-ui/react';
import Markdown from 'markdown-to-jsx';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import MemberProfile from '../../components/member-profile';
import SEO from '../../components/seo';
import Section from '../../components/section';
import { isErrorMessage, StudentGroup, StudentGroupAPI, Member } from '../../lib/api';
import MapMarkdownChakra from '../../markdown';

interface Props {
    studentGroup: StudentGroup;
}

const StudentGroupPage = ({ studentGroup }: Props): JSX.Element => {
    const router = useRouter();

    return (
        <>
            {router.isFallback && (
                <Center>
                    <Spinner />
                </Center>
            )}
            {!router.isFallback && (
                <>
                    <SEO title={studentGroup.name} />
                    <Section>
                        <Heading textAlign="center" size="2xl" pb="2rem">
                            {studentGroup.name}
                        </Heading>
                        <Divider mb="1rem" />
                        <Markdown options={{ overrides: MapMarkdownChakra }}>{studentGroup.info}</Markdown>
                        <Divider my="5" />
                        <Wrap spacing={['1em', null, '2.5em']} justify="center">
                            {studentGroup.members.map((member: Member) => (
                                <WrapItem key={member.profile.name}>
                                    <MemberProfile profile={member.profile} role={member.role} />
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Section>
                </>
            )}
        </>
    );
};

const getStaticPaths: GetStaticPaths = async () => {
    const paths = await StudentGroupAPI.getPaths();

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
    const studentGroup = await StudentGroupAPI.getStudentGroupBySlug(slug);

    if (isErrorMessage(studentGroup)) {
        if (studentGroup.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(studentGroup.message);
    }

    const props: Props = {
        studentGroup,
    };

    return {
        props,
    };
};

export default StudentGroupPage;
export { getStaticPaths, getStaticProps };
