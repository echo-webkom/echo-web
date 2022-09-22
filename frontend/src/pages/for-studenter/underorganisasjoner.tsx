import { StudentGroup, StudentGroupAPI } from '@api/student-group';
import { Box, Divider, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import Section from '@components/section';
import SEO from '@components/seo';
import { isErrorMessage } from '@utils/error';

interface Props {
    subOrgs: Array<StudentGroup>;
}

const BoardPage = ({ subOrgs }: Props) => {
    return (
        <>
            <SEO title="Interessegrupper" />
            <Section>
                <Heading textAlign="center" size="2xl" pb="2rem">
                    Underorgranisasjoner
                </Heading>

                <Divider mb="1rem" />

                <Text my="5">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus nihil, maiores iusto modi eos
                    magni itaque, harum deserunt sapiente error velit natus accusantium voluptate maxime similique
                    delectus officia dignissimos tempore?
                </Text>

                <Divider mb="1rem" />

                <SimpleGrid columns={[1, 2, 3]} spacing={4}>
                    {subOrgs.map((group) => {
                        return (
                            <NextLink href={'/for-studenter/studentgrupper/' + group.slug}>
                                <Text textAlign="center" py="10" bg="gray.300" borderRadius="xl">
                                    {group.name}
                                </Text>
                            </NextLink>
                        );
                    })}
                </SimpleGrid>
            </Section>
        </>
    );
};

export const getStaticProps = async () => {
    const subOrgs = await StudentGroupAPI.getStudentGroupsByType('suborg');

    if (isErrorMessage(subOrgs)) {
        if (subOrgs.message === '404') {
            return {
                notFound: true,
            };
        }
        throw new Error(subOrgs.message);
    }

    return {
        props: {
            subOrgs,
        },
    };
};

export default BoardPage;
