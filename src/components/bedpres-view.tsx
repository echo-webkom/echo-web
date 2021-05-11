import React from 'react';
import { Button, Heading, Table, Thead, Tbody, Tr, Th, Td, useToast, useBreakpointValue } from '@chakra-ui/react';
import { format, parseISO, compareAsc } from 'date-fns';

import ContentBox from './content-box';
import { Registration } from '../lib/api/registration';

const BedpresView = ({ registrations }: { registrations: Array<Registration> }): JSX.Element => {
    const toast = useToast();
    const tbSize = useBreakpointValue(['sm', null, null, 'md']) || 'md';
    registrations.sort((fst, snd) => compareAsc(parseISO(fst.submitDate), parseISO(snd.submitDate)));

    return (
        <ContentBox>
            <Heading mb=".75rem">Påmeldte</Heading>
            <Button
                my="1rem"
                onClick={() => {
                    navigator.clipboard.writeText(
                        registrations
                            .map((reg: Registration) => {
                                return reg.email;
                            })
                            .reduce((acc: string, email: string) => {
                                return `${acc}\n${email}`;
                            }),
                    );
                    toast({
                        title: 'Mailer kopiert til utklippstavlen!',
                        status: 'info',
                        duration: 5000,
                        isClosable: true,
                    });
                }}
            >
                Kopier mailer
            </Button>
            <Table variant="simple" size={tbSize}>
                <Thead>
                    <Tr>
                        <Th>Email</Th>
                        <Th>Fornavn</Th>
                        <Th>Etternavn</Th>
                        <Th>Studieretning</Th>
                        <Th>Studieår</Th>
                        <Th>Godkjent retningslinjer</Th>
                        <Th>Påmeldingstidspunkt</Th>
                        <Th>Venteliste</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {registrations.map((reg: Registration) => {
                        return (
                            <Tr key={reg.email}>
                                <Td>{reg.email}</Td>
                                <Td>{reg.firstName}</Td>
                                <Td>{reg.lastName}</Td>
                                <Td>{reg.degree}</Td>
                                <Td>{reg.degreeYear}</Td>
                                <Td>{reg.terms ? 'Ja' : 'Nei'}</Td>
                                <Td>{format(parseISO(reg.submitDate), 'dd.MM kk:mm:ss')}</Td>
                                <Td>{reg.waitList ? 'Ja' : 'Nei'}</Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </ContentBox>
    );
};

export default BedpresView;
