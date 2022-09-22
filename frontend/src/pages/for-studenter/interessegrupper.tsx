import { StudentGroup, StudentGroupAPI } from '@api/student-group';
import { Box, Divider, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import Section from '@components/section';
import SEO from '@components/seo';
import { isErrorMessage } from '@utils/error';

interface Props {
    interestGroups: Array<StudentGroup>;
}

const BoardPage = ({ interestGroups }: Props) => {
    return (
        <>
            <SEO title="Interessegrupper" />
            <Section>
                <Heading textAlign="center" size="2xl" pb="2rem">
                    Interessegrupepr
                </Heading>

                <Divider mb="1rem" />

                <Text my="5">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus nihil, maiores iusto modi eos
                    magni itaque, harum deserunt sapiente error velit natus accusantium voluptate maxime similique
                    delectus officia dignissimos tempore?
                </Text>

                <Divider mb="1rem" />

                <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                    {interestGroups.map((group) => {
                        return (
                            <Text textAlign="center" py="10" bg="gray.300" borderRadius="xl">
                                {group.name}
                            </Text>
                        );
                    })}
                </SimpleGrid>
            </Section>
        </>
    );
};

export const getStaticProps = async () => {
    const interestGroups = await StudentGroupAPI.getStudentGroupsByType('intgroup');

    if (isErrorMessage(interestGroups)) {
        if (interestGroups.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(interestGroups.message);
    }

    return {
        props: {
            interestGroups,
        },
    };
};

export default BoardPage;
