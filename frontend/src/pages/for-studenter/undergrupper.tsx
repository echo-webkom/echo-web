import { StudentGroup, StudentGroupAPI } from '@api/student-group';
import { Box, Divider, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import Section from '@components/section';
import SEO from '@components/seo';
import { isErrorMessage } from '@utils/error';

interface Props {
    subGroup: Array<StudentGroup>;
}

const BoardPage = ({ subGroup }: Props) => {
    return (
        <>
            <SEO title="Interessegrupper" />
            <Section>
                <Heading textAlign="center" size="2xl" pb="2rem">
                    Undergrupper
                </Heading>

                <Divider mb="1rem" />

                <Text my="5">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus nihil, maiores iusto modi eos
                    magni itaque, harum deserunt sapiente error velit natus accusantium voluptate maxime similique
                    delectus officia dignissimos tempore?
                </Text>

                <Divider mb="1rem" />

                <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                    {subGroup.map((group) => {
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
    const subGroup = await StudentGroupAPI.getStudentGroupsByType('subgroup');

    if (isErrorMessage(subGroup)) {
        if (subGroup.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(subGroup.message);
    }

    return {
        props: {
            subGroup,
        },
    };
};

export default BoardPage;
