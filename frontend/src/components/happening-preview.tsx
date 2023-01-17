import { Box, Spacer, useColorModeValue, Text, Flex, LinkOverlay, LinkBox } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import HappeningKeyInfo from '@components/happening-key-info';
import type { Happening } from '@api/happening';
import type { RegistrationCount } from '@api/registration';
import ReactionCount from '@components/reaction-count';

interface Props {
    happening: Happening;
    registrationCounts?: Array<RegistrationCount>;
}

const HappeningPreview = ({ happening, registrationCounts }: Props): JSX.Element => {
    const hoverColor = useColorModeValue('bg.light.hover', 'bg.dark.hover');

    return (
        <LinkBox data-testid={happening.slug}>
            <Flex alignItems="center" h="125px" p={[0, null, null, null, 5]} _hover={{ bg: hoverColor }}>
                <Flex alignItems="center" gap="5">
                    {happening.logoUrl && (
                        <Box display={['none', 'block']}>
                            <Box>
                                <Image
                                    style={{ borderRadius: '100%' }}
                                    src={happening.logoUrl}
                                    alt={happening.title}
                                    width={85}
                                    height={85}
                                />
                            </Box>
                        </Box>
                    )}
                    <Box>
                        <LinkOverlay as={NextLink} href={`/event/${happening.slug}`}>
                            <Text fontWeight="regular">{happening.title}</Text>
                        </LinkOverlay>
                        <ReactionCount slug={happening.slug} />
                    </Box>
                </Flex>

                <Spacer />

                <Box minW="fit-content">
                    <HappeningKeyInfo event={happening} registrationCounts={registrationCounts} />
                </Box>
            </Flex>
        </LinkBox>
    );
};

export default HappeningPreview;
