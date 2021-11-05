import { Flex, Heading, Icon, Link, List, ListItem, Text, useColorModeValue } from '@chakra-ui/react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import NextLink from 'next/link';
import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Minute } from '../lib/api';
import ErrorBox from './error-box';

const MinuteList = ({ minutes, error }: { minutes: Array<Minute> | null; error: string | null }): JSX.Element => {
    const color = useColorModeValue('blue', 'blue.400');

    return (
        <>
            <Heading mb="5">Møtereferater</Heading>
            {!minutes && error && <ErrorBox error={error} />}
            {minutes && !error && minutes.length === 0 && <Text>Ingen møtereferater</Text>}
            {minutes && !error && (
                <List>
                    {minutes.map((minute: Minute) => (
                        <ListItem key={minute.date}>
                            <Flex align="center">
                                <NextLink href={minute.document} passHref>
                                    <Link href={minute.document} color={color} isExternal mr=".5em">
                                        {format(new Date(minute.date), 'dd. MMM yyyy', { locale: nb })}
                                    </Link>
                                </NextLink>
                                <Icon as={FaExternalLinkAlt} />
                            </Flex>
                        </ListItem>
                    ))}
                </List>
            )}
        </>
    );
};

export default MinuteList;
