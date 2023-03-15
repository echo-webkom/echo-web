import { Box, Spacer, useColorModeValue, Text, Flex } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import HappeningKeyInfo from '@components/happening-key-info';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';

interface Props {
    bedpres: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const BedpresPreview = ({ bedpres, registrationCounts }: Props) => {
    const hoverColor = useColorModeValue('bg.light.hover', 'bg.dark.hover');

    const logoUrl = bedpres.logoUrl as string;

    return (
        <NextLink data-testid={bedpres.slug} href={`/event/${bedpres.slug}`}>
            <Flex alignItems="center" p={[0, null, null, null, 5]} _hover={{ bg: hoverColor }}>
                <Flex alignItems="center" gap="5">
                    <Box>
                        <Box
                            pos="relative"
                            overflow="hidden"
                            borderRadius="50%"
                            w={['75px', '85px']}
                            h={['75px', '85px']}
                        >
                            <Image src={logoUrl} alt={bedpres.title} fill />
                        </Box>
                    </Box>
                    <Box display={['none', null, 'block']}>
                        <Text fontWeight="regular">{bedpres.title}</Text>
                    </Box>
                </Flex>

                <Spacer />

                <Box minW="fit-content">
                    <HappeningKeyInfo event={bedpres} registrationCounts={registrationCounts} />
                </Box>
            </Flex>
        </NextLink>
    );
};

export default BedpresPreview;
