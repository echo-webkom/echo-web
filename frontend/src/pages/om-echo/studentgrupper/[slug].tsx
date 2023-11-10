import type { ParsedUrlQuery } from 'querystring';
import { Center, Divider, Heading, Wrap, WrapItem, Image } from '@chakra-ui/react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Markdown from 'markdown-to-jsx';
import SEO from '@components/seo';
import type { StudentGroup, Member } from '@api/student-group';
import { StudentGroupAPI } from '@api/student-group';
import { isErrorMessage } from '@utils/error';
import SidebarWrapper from '@components/sidebar-wrapper';
import MapMarkdownChakra from '@utils/markdown';
import MemberProfile from '@components/member-profile';

interface Props {
    studentGroup: StudentGroup;
}

const StudentGroupPage = ({ studentGroup }: Props) => {
    return (
        <>
            <SEO title={studentGroup.name} />
            <SidebarWrapper>
                <Heading textAlign="center" size="2xl" pb="2rem">
                    {studentGroup.name}
                </Heading>
                <Divider mb="1rem" />
                {studentGroup.info && (
                    <>
                        <Markdown options={{ overrides: MapMarkdownChakra }}>{studentGroup.info}</Markdown>
                        <Divider my="5" />
                    </>
                )}
                {studentGroup.imageUrl && (
                    <>
                        <Center>
                            <Image
                                src={studentGroup.imageUrl}
                                alt=""
                                objectFit="cover"
                                maxHeight="570px"
                                minWidth="100%"
                            />
                        </Center>
                        <Divider my="5" />
                    </>
                )}
                <Wrap spacing={['1em', null, '2.5em']} justify="center">
                    {studentGroup.members.map((member: Member, i) => (
                        <WrapItem key={`${member.profile._id}${i}`}>
                            <MemberProfile profile={member.profile} role={member.role} />
                        </WrapItem>
                    ))}
                </Wrap>
            </SidebarWrapper>
        </>
    );
};

const getStaticPaths: GetStaticPaths = async () => {
    const paths = await StudentGroupAPI.getPaths();

    if (isErrorMessage(paths)) {
        throw new Error(paths.message);
    }

    return {
        paths: paths.map((slug: string) => ({
            params: {
                slug,
            },
        })),
        fallback: false,
    };
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params as Params;
    const studentGroup = await StudentGroupAPI.getStudentGroupBySlug(slug);

    if (isErrorMessage(studentGroup)) {
        return {
            notFound: true,
        };
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
