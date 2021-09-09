import React from 'react';
import { Button, Heading, Table, Thead, Tbody, Tr, Th, Td, useToast, useBreakpointValue } from '@chakra-ui/react';
import { format, parseISO, compareAsc } from 'date-fns';

import Section from './section';
import { Registration, Answer } from '../lib/api/registration';
import { Bedpres } from '../lib/api/bedpres';
import { Event } from '../lib/api/event';
import { Question } from '../lib/api/decoders';

const CopyEmailButton = ({
    buttonText,
    toastText,
    emailsString,
}: {
    buttonText: string;
    toastText: string;
    emailsString: string;
}): JSX.Element => {
    const toast = useToast();

    return (
        <Button
            my="1rem"
            onClick={() => {
                navigator.clipboard.writeText(emailsString);
                toast({
                    title: toastText,
                    status: 'info',
                    duration: 5000,
                    isClosable: true,
                });
            }}
        >
            {buttonText}
        </Button>
    );
};

const HappeningView = ({
    registrations,
    happening,
}: {
    registrations: Array<Registration>;
    happening: Bedpres | Event | null;
}): JSX.Element => {
    const tbSize = useBreakpointValue(['sm', null, null, 'md']) || 'md';
    registrations.sort((fst, snd) => compareAsc(parseISO(fst.submitDate), parseISO(snd.submitDate)));

    return (
        <Section>
            <Heading mb=".75rem">Påmeldte</Heading>
            <CopyEmailButton
                emailsString={registrations
                    .map((reg: Registration) => {
                        return reg.email;
                    })
                    .reduce((acc: string, email: string) => {
                        return `${acc}\n${email}`;
                    })}
                buttonText="Kopier alle mailer"
                toastText="Mailer kopiert til utklippstavlen!"
            />
            <CopyEmailButton
                emailsString={registrations
                    .map((reg: Registration) => {
                        return reg.waitList ? '' : reg.email;
                    })
                    .reduce((acc: string, email: string) => {
                        return `${acc}\n${email}`;
                    })}
                buttonText="Kopier mailer (uten venteliste)"
                toastText="Mailer (uten venteliste) kopiert til utklippstavlen!"
            />
            <CopyEmailButton
                emailsString={registrations
                    .map((reg: Registration) => {
                        return reg.waitList ? reg.email : '';
                    })
                    .reduce((acc: string, email: string) => {
                        return `${acc}\n${email}`;
                    })}
                buttonText="Kopier mailer (bare venteliste)"
                toastText="Mailer (bare venteliste) kopiert til utklippstavlen!"
            />
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
                        {happening?.additionalQuestions.map((q: Question) => {
                            return <Th key={`table-th-${q.questionText}`}>{q.questionText}</Th>;
                        })}
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
                                {reg.answers.map((a: Answer) => {
                                    return <Td key={`table-td-${a.question}`}>{a.answer}</Td>;
                                })}
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </Section>
    );
};

export default HappeningView;
