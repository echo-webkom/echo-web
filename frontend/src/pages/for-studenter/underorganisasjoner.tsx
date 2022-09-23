import { StudentGroup, StudentGroupAPI } from '@api/student-group';
import { Divider, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import Section from '@components/section';
import SEO from '@components/seo';
import { isErrorMessage } from '@utils/error';
import StudentGroupPreview from '@components/student-group-preview';

interface Props {
    studentGroups: Array<StudentGroup>;
}

const SubOrgPage = ({ studentGroups }: Props) => {
    return (
        <>
            <SEO title="Underorganisasjoner" />
            <Section>
                <Heading textAlign="center" size="2xl" pb="2rem">
                    Underorganisasjoner
                </Heading>

                <Divider mb="1rem" />

                <Text my="5">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus nihil, maiores iusto modi eos
                    magni itaque, harum deserunt sapiente error velit natus accusantium voluptate maxime similique
                    delectus officia dignissimos tempore?
                </Text>

                <SimpleGrid columns={[1, null, 2, null, 3]} spacing={4}>
                    <StudentGroupPreview {...{ studentGroups }} />
                </SimpleGrid>
            </Section>
        </>
    );
};

export const getStaticProps = async () => {
    const studentGroups = await StudentGroupAPI.getStudentGroupsByType('suborg');

    if (isErrorMessage(studentGroups)) {
        if (studentGroups.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(studentGroups.message);
    }

    return {
        props: {
            studentGroups,
        },
    };
};

export default SubOrgPage;
