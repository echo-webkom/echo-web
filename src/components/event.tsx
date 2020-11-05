import React from 'react';

import { Flex, Image, Text, SimpleGrid } from '@chakra-ui/core';

interface EventData {
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
}

const Event = ({ imageSrc, imageAlt, title, description }: EventData): JSX.Element => {
    return (
        <Flex justifyContent="center" align="center">
            <SimpleGrid columns={2}>
                <SimpleGrid rows={2}>
                    <Text fontSize="3xl">{title}</Text>
                    <Text fontSize="m">{description}</Text>
                </SimpleGrid>
                <Image width="300px" src={imageSrc} alt={imageAlt} />
            </SimpleGrid>
        </Flex>
    );
};

export default Event;
