import { Box, Flex, LinkBox, LinkOverlay, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import Image from 'next/image';
import { format, isToday } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';
import { BiCalendar } from 'react-icons/bi';
import type { Happening } from '@api/happening';
import useLanguage from '@hooks/use-language';

const ProfileHappeningPreview = ({ event }: { event: Happening }) => {
    const hoverColor = useColorModeValue('bg.light.hover', 'bg.dark.hover');
    const logoUrl = event.logoUrl as string;

    return (
        <LinkBox data-testid={event.slug} py="1rem">
            <>
                {event.happeningType === 'BEDPRES' ? (
                    <Flex
                        alignItems="center"
                        justifyContent="space-between"
                        p={[0, null, null, null, 5]}
                        _hover={{ bg: hoverColor }}
                    >
                        <Flex alignItems="center" gap="5">
                            <Box display={['none', 'block']}>
                                <Box pos="relative" overflow="hidden" borderRadius="50%" w="85px" h="85px">
                                    <Image src={logoUrl} alt={event.title} fill />
                                </Box>
                            </Box>
                            <Box>
                                <Text fontWeight="regular" fontSize="larger">
                                    <LinkOverlay as={NextLink} href={`/event/${event.slug}`}>
                                        {event.title}
                                    </LinkOverlay>
                                </Text>
                            </Box>
                        </Flex>
                        <HappeningPreviewDate event={event} />
                    </Flex>
                ) : (
                    <Flex alignItems="center" justifyContent="space-between">
                        <Box>
                            <LinkOverlay
                                as={NextLink}
                                href={`/event/${event.slug}`}
                                _hover={{ textDecor: 'underline' }}
                            >
                                {event.title}
                            </LinkOverlay>
                        </Box>
                        <HappeningPreviewDate event={event} />
                    </Flex>
                )}
            </>
        </LinkBox>
    );
};

const HappeningPreviewDate = ({ event }: { event: Happening }) => {
    const isNorwegian = useLanguage();
    return (
        <Stack textAlign="right">
            <Flex alignItems="center" justifyContent="flex-end">
                <BiCalendar />
                {isToday(new Date(event.date)) ? (
                    <>
                        <Text ml="1" fontWeight="bold">
                            {isNorwegian ? `I dag ` : `Today `}
                        </Text>
                        <Text ml="1" fontSize="1rem">
                            {format(new Date(event.date), isNorwegian ? 'HH:mm' : 'h:aaa')}
                        </Text>
                    </>
                ) : (
                    format(new Date(event.date), 'dd. MMM', { locale: isNorwegian ? nb : enUS })
                )}
            </Flex>
        </Stack>
    );
};

export default ProfileHappeningPreview;
