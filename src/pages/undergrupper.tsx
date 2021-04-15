import React from 'react';
import { GetStaticProps } from 'next';
import { Heading, Text, Wrap, WrapItem } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Markdown from 'markdown-to-jsx';
import { Profile, Role, StudentGroup } from '../lib/types';
import Layout from '../components/layout';
import ContentBox from '../components/content-box';
import { StudentGroupAPI } from '../lib/api';
import MapMarkdownChakra from '../markdown';
import MemberProfile from '../components/member-profile';

const SubgroupPage = ({ subgroups }: { subgroups: Array<StudentGroup> }): JSX.Element => {
    const router = useRouter();

    return (
        <Layout>
            <ContentBox>
                {router.isFallback && <Text>Loading...</Text>}
                {!router.isFallback &&
                    subgroups.map((subgroup: StudentGroup) => (
                        <>
                            <Heading mb="5">{subgroup.name}</Heading>
                            <Markdown options={MapMarkdownChakra}>{subgroup.info}</Markdown>
                            <Heading size="lg" mb="5">
                                Medlemmer
                            </Heading>
                            <Wrap spacing={['1em', null, '2.5em']} justify="center">
                                {subgroup.roles.map((role: Role) =>
                                    role.members.map((profile: Profile) => (
                                        <WrapItem>
                                            <MemberProfile profile={profile} role={role.name} />
                                        </WrapItem>
                                    )),
                                )}
                            </Wrap>
                        </>
                    ))}
                <Heading />
            </ContentBox>
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const subgroups = await StudentGroupAPI.getStudentGroups('subgroup');

    return {
        props: {
            subgroups,
        },
    };
};

export default SubgroupPage;
