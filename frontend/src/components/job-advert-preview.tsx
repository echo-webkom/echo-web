import {
    Avatar,
    GridItem,
    Box,
    SimpleGrid,
    Spacer,
    Tag,
    Text,
    useColorModeValue,
    Wrap,
    LinkBox,
    LinkOverlay,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import NextLink from 'next/link';
import type { JobAdvert } from '@api/job-advert';
import degreeYearText from '@utils/degree-year-text';
import translateJobType from '@utils/translate-job-type';
import useLanguage from '@hooks/use-language';

const JobAdvertPreview = ({ jobAdvert }: { jobAdvert: JobAdvert }) => {
    const borderColor = useColorModeValue('bg.light.border', 'bg.dark.border');
    const bgColor = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    const isNorwegian = useLanguage();

    return (
        <LinkBox>
            <Box
                w="100%"
                p="1rem"
                my="1rem"
                pos="relative"
                bg={bgColor}
                border="2px"
                borderColor="transparent"
                borderRadius="0.5rem"
                _hover={{ borderColor: borderColor }}
                data-testid={jobAdvert.slug}
            >
                <SimpleGrid columns={2} alignItems="start">
                    <GridItem>
                        <LinkOverlay as={NextLink} href={`/jobb/${jobAdvert.slug}`}>
                            <Text mb="1rem" fontWeight="bold" fontSize={['1.2rem', null, null, '1.5rem']}>
                                {jobAdvert.title}
                            </Text>
                        </LinkOverlay>
                        <Wrap>
                            <Tag colorScheme="teal" variant="subtle">
                                {translateJobType(jobAdvert.jobType, isNorwegian)}
                            </Tag>
                            {jobAdvert.locations.map((location: string, index: number) => (
                                <Tag colorScheme="teal" variant="solid" key={`${location}-${index}`}>
                                    {location}
                                </Tag>
                            ))}
                            <Tag colorScheme="teal" variant="outline">
                                {degreeYearText(jobAdvert.degreeYears, isNorwegian)}
                            </Tag>
                            <Spacer />
                        </Wrap>
                        <Tag mt=".5rem">{`Søknadsfrist: ${format(new Date(jobAdvert.deadline), 'dd.MM.yyyy')}`}</Tag>
                    </GridItem>
                    <GridItem>
                        <SimpleGrid>
                            <GridItem>
                                <Tag mb="2rem" float="right" fontSize=".85rem">{`Publisert: ${format(
                                    new Date(jobAdvert._createdAt),
                                    'dd.MM.yyyy',
                                )}`}</Tag>
                            </GridItem>
                            <GridItem>
                                <Avatar float="right" size="xl" src={jobAdvert.logoUrl} />
                            </GridItem>
                        </SimpleGrid>
                    </GridItem>
                </SimpleGrid>
            </Box>
        </LinkBox>
    );
};

export default JobAdvertPreview;
