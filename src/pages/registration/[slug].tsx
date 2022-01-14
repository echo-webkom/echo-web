import { ParsedUrlQuery } from 'querystring';
import {
    useBreakpointValue,
    Divider,
    GridItem,
    Heading,
    SimpleGrid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import React from 'react';
import ErrorBox from '../../components/error-box';
import ButtonLink from '../../components/button-link';
import { RegistrationAPI, Registration, registrationRoute } from '../../lib/api';
import Section from '../../components/section';

interface Props {
    registrations: Array<Registration> | null;
    error: string | null;
    link: string;
    backendUrl: string;
}

const notEmptyOrNull = <E,>(e: Array<E> | null) => e && e.length > 0;

const RegistrationsPage = ({ registrations, error, link, backendUrl }: Props): JSX.Element => {
    const questions =
        registrations
            ?.flatMap((reg) => reg.answers)
            ?.map((ans) => ans.question)
            ?.filter((e, i, arr) => arr.indexOf(e) === i) ?? null;

    const tableSize = useBreakpointValue({ base: 'sm', lg: 'md' });
    const headingSize = useBreakpointValue({ base: 'xl', lg: '2xl' });
    const justifyHeading = useBreakpointValue({ base: 'center', lg: 'left' });
    const justifyBtn = useBreakpointValue({ base: 'center', lg: 'right' });

    return (
        <Section overflowX="scroll">
            {error && !registrations && <ErrorBox error={error} />}
            {registrations && registrations.length === 0 && !error && <Heading>Ingen påmeldinger enda</Heading>}
            {registrations && registrations.length > 0 && !error && (
                <>
                    <SimpleGrid p="1rem" columns={[1, null, 3]} rows={[2, null, 1]} alignItems="center">
                        <Heading
                            as={GridItem}
                            size={headingSize}
                            justifySelf={justifyHeading}
                            colSpan={[1, null, 2]}
                        >{`Påmeldinger for '${registrations[0].slug}'`}</Heading>
                        <GridItem justifySelf={justifyBtn}>
                            <ButtonLink
                                text="Last ned som CSV"
                                linkTo={`${backendUrl}/${registrationRoute}/${link}?download=y`}
                            />
                        </GridItem>
                    </SimpleGrid>
                    <Divider mb="1em" />
                    <Table size={tableSize} variant="striped">
                        <Thead>
                            <Tr>
                                <Th>Email</Th>
                                <Th>Fornavn</Th>
                                <Th>Etternavn</Th>
                                <Th>Årstrinn</Th>
                                {notEmptyOrNull(questions) &&
                                    questions?.map((q, index) => <Th key={`question-${index}`}>{q}</Th>)}
                                <Th>På venteliste?</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {registrations.map((reg) => {
                                return (
                                    <Tr key={JSON.stringify(reg)}>
                                        <Td>{reg.email}</Td>
                                        <Td>{reg.firstName}</Td>
                                        <Td>{reg.lastName}</Td>
                                        <Td>{reg.degreeYear}</Td>
                                        {notEmptyOrNull(reg.answers) &&
                                            reg.answers.map((ans, index) => (
                                                <Td key={`answer-${index}-${JSON.stringify(ans)}`}>{ans.answer}</Td>
                                            ))}
                                        {!notEmptyOrNull(reg.answers) && notEmptyOrNull(questions) && (
                                            <Td fontStyle="italic">{`ikke besvart`}</Td>
                                        )}
                                        <Td>{reg.waitList ? 'Ja' : 'Nei'}</Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </>
            )}
        </Section>
    );
};

interface Params extends ParsedUrlQuery {
    slug: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as Params;
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';
    const { registrations, error } = await RegistrationAPI.getRegistrations(slug, backendUrl);

    if (error === '404') {
        return {
            notFound: true,
        };
    }

    const props: Props = {
        registrations,
        error,
        link: slug,
        backendUrl,
    };

    return {
        props,
    };
};

export default RegistrationsPage;
