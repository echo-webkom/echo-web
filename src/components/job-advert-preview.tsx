import {
    Avatar,
    GridItem,
    LinkBox,
    LinkOverlay,
    SimpleGrid,
    Spacer,
    Tag,
    Text,
    useColorModeValue,
    Wrap,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import NextLink from 'next/link';
import React from 'react';
import { JobAdvert } from '../lib/api';

const translateJobType = (jobType: 'fulltime' | 'parttime' | 'internship' | 'summerjob'): string => {
    switch (jobType) {
        case 'fulltime':
            return 'Fulltid';
        case 'parttime':
            return 'Deltid';
        case 'internship':
            return 'Internship';
        case 'summerjob':
            return 'Sommerjobb';
    }
};

const JobAdvertPreview = ({ jobAdvert }: { jobAdvert: JobAdvert }): JSX.Element => {
    const borderColor = useColorModeValue('bg.light.border', 'bg.dark.border');
    const bgColor = useColorModeValue('bg.light.tertiary', 'bg.dark.tertiary');

    return (
        <LinkBox
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
            <NextLink href={`/jobs/${jobAdvert.slug}`} passHref>
                <LinkOverlay>
                    <SimpleGrid columns={2} alignItems="start">
                        <GridItem>
                            <Text mb="1rem" fontWeight="bold" fontSize={['1.2rem', null, null, '1.5rem']}>
                                {jobAdvert.title}
                            </Text>
                            <Wrap>
                                <Tag colorScheme="teal" variant="subtle">
                                    {translateJobType(jobAdvert.jobType)}
                                </Tag>
                                {jobAdvert.locations.map((location: string, index: number) => (
                                    <Tag colorScheme="teal" variant="solid" key={`${location}-${index}`}>
                                        {location}
                                    </Tag>
                                ))}
                                <Tag colorScheme="teal" variant="outline">
                                    {jobAdvert.degreeYears.length === 1
                                        ? `${String(jobAdvert.degreeYears[0])}. trinn`
                                        : `${String(jobAdvert.degreeYears.sort().slice(0, -1).join(', '))} og ${String(
                                              jobAdvert.degreeYears.slice(-1),
                                          )} . trinn`}
                                </Tag>
                                <Spacer />
                            </Wrap>
                            <Tag mt=".5rem">{`Søknadsfrist: ${format(
                                new Date(jobAdvert.deadline),
                                'dd.MM.yyyy',
                            )}`}</Tag>
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
                </LinkOverlay>
            </NextLink>
        </LinkBox>
    );
};

export { translateJobType };
export default JobAdvertPreview;
