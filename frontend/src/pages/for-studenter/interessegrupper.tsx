import { Divider, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import type { StudentGroup } from '@api/student-group';
import { StudentGroupAPI } from '@api/student-group';
import Section from '@components/section';
import SEO from '@components/seo';
import { isErrorMessage } from '@utils/error';
import StudentGroupPreview from '@components/student-group-preview';

interface Props {
    studentGroups: Array<StudentGroup>;
}

const IntGroupPage = ({ studentGroups }: Props) => {
    return (
        <>
            <SEO title="Interessegrupper" />
            <Section>
                <Heading textAlign="center" size="2xl" pb="2rem">
                    Interessegrupper
                </Heading>

                <Divider mb="1rem" />

                <Text my="5">
                    Grupper som legger til rette for en fritidsinteresse blant våre studenter, i samråd med echo.
                </Text>

                <SimpleGrid columns={[1, null, 2, null, 3]} spacing={4}>
                    {studentGroups.map((group) => (
                        <StudentGroupPreview key={group.slug} {...{ group }} />
                    ))}
                </SimpleGrid>
            </Section>
        </>
    );
};

export const getStaticProps = async () => {
    const studentGroups = await StudentGroupAPI.getStudentGroupsByType('intgroup');

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

export default IntGroupPage;
