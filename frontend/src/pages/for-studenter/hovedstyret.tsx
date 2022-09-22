import { StudentGroup, StudentGroupAPI } from '@api/student-group';
import { Box, Divider, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import Section from '@components/section';
import SEO from '@components/seo';
import { isErrorMessage } from '@utils/error';

interface Props {
    boards: Array<StudentGroup>;
}

const BoardPage = ({ boards }: Props) => {
    return (
        <>
            <SEO title="Hovedstyret" />
            <Section>
                <Heading textAlign="center" size="2xl" pb="2rem">
                    Hovedstyret
                </Heading>

                <Divider mb="1rem" />

                <Text my="5">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus nihil, maiores iusto modi eos
                    magni itaque, harum deserunt sapiente error velit natus accusantium voluptate maxime similique
                    delectus officia dignissimos tempore?
                </Text>

                <Divider mb="1rem" />

                <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                    {boards.map((board) => {
                        return (
                            <Text textAlign="center" py="10" bg="gray.300" borderRadius="xl">
                                {board.name}
                            </Text>
                        );
                    })}
                </SimpleGrid>
            </Section>
        </>
    );
};

export const getStaticProps = async () => {
    const boards = await StudentGroupAPI.getStudentGroupsByType('board');

    if (isErrorMessage(boards)) {
        if (boards.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(boards.message);
    }

    return {
        props: {
            boards,
        },
    };
};

export default BoardPage;
