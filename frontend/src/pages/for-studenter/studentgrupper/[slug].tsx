import { Center, Divider, Heading, Spinner, Wrap, WrapItem, Image } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Markdown from 'markdown-to-jsx';
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import SEO from '@components/seo';
import type { StudentGroup, Member } from '@api/student-group';
import { StudentGroupAPI } from '@api/student-group';
import { isErrorMessage } from '@utils/error';
import MapMarkdownChakra from '@utils/markdown';
import MemberProfile from '@components/member-profile';
import Section from '@components/section';

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

const getStaticPaths = async () => {
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
        fallback: true,
    };
};

const getStaticProps = async ({ params }: { params: Params }) => {
    const studentGroup = await StudentGroupAPI.getStudentGroupBySlug(params.slug);

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
