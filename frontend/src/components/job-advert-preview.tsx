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

    const subtleTagBg = useColorModeValue('purple.200', 'purple.500');
    const solidTagBg = useColorModeValue('highlight.light.primary', 'highlight.dark.primary');
    const solidTagColor = useColorModeValue('text.dark.primary', 'text.dark.secondary');
    const outlineTagBg = useColorModeValue('highlight.light.tertiary', 'highlight.dark.tertiary');
    const subtleOutlineTagColor = useColorModeValue('highlight.dark.tertiary', 'text.dark.primary');

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
                            <Tag bg={subtleTagBg} color={subtleOutlineTagColor} variant="subtle">
                                {translateJobType(jobAdvert.jobType, isNorwegian)}
                            </Tag>
                            {jobAdvert.locations.map((location: string, index: number) => (
                                <Tag bg={solidTagBg} color={solidTagColor} variant="solid" key={`${location}-${index}`}>
                                    {location}
                                </Tag>
                            ))}
                            <Tag bg={outlineTagBg} color={subtleOutlineTagColor} variant="outline">
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
