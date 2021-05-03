import React, { useRef } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalFooter,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    Input,
    Radio,
    RadioGroup,
    VStack,
    Select,
    Checkbox,
    useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Degree, Registration } from '../lib/api/registration';

const BedpresForm = ({
    slug,
    title,
    backendHost,
}: {
    slug: string;
    title: string;
    backendHost: string;
}): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { register, handleSubmit } = useForm();
    const toast = useToast();
    const initialRef = useRef<HTMLInputElement | null>(null);
    const { ref, ...rest } = register('email'); // needed for inital focus ref

    const submitForm = (data: Registration) =>
        axios
            .post(
                `https://${backendHost}/registration`,
                {
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    degree: data.degree,
                    degreeYear: data.degreeYear,
                    slug,
                    terms: data.terms,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            )
            .then(() => {
                toast({
                    title: 'Ditt svar ble registrert!',
                    description: `Du er meldt på ${title}.`,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                });
            })
            .catch(() => {
                toast({
                    title: 'Det har skjedd en feil.',
                    description: `Vennligst prøv igjen.`,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
            });

    return (
        <>
            <Button w="100%" colorScheme="teal" onClick={onOpen}>
                Påmelding
            </Button>

            <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="2">
                    <form onSubmit={handleSubmit(submitForm)}>
                        <ModalHeader>Påmelding</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb="8px">
                            <VStack spacing={4}>
                                <FormControl id="email" isRequired>
                                    <FormLabel>E-post</FormLabel>
                                    <Input
                                        type="email"
                                        placeholder="E-post"
                                        {...rest}
                                        // using multiple refs
                                        ref={(e) => {
                                            ref(e);
                                            initialRef.current = e;
                                        }}
                                    />
                                </FormControl>
                                <FormControl id="firstName" isRequired>
                                    <FormLabel>Fornavn</FormLabel>
                                    <Input placeholder="Fornavn" {...register('firstName')} />
                                </FormControl>
                                <FormControl id="lastName" isRequired>
                                    <FormLabel>Etternavn</FormLabel>
                                    <Input placeholder="Etternavn" {...register('lastName')} />
                                </FormControl>
                                <FormControl id="degree" isRequired>
                                    <FormLabel>Studieretning</FormLabel>
                                    <Select placeholder="Velg studieretning" {...register('degree')}>
                                        <option value={Degree.DTEK}>Datateknologi</option>
                                        <option value={Degree.DVIT}>Datasikkerhet</option>
                                        <option value={Degree.BINF}>Bioinformatikk</option>
                                        <option value={Degree.IMØ}>Informatikk-matematikk-økonomi</option>
                                        <option value={Degree.IKT}>Informasjons- og kommunikasjonsvitenskap</option>
                                        <option value={Degree.KOGNI}>
                                            Kognitiv vitenskap med spesialisering i informatikk
                                        </option>
                                        <option value={Degree.INF}>Master i informatikk</option>
                                        <option value={Degree.PROG}>Felles master i programvareutvikling</option>
                                        <option value={Degree.ÅRMNINF}>Årsstudium i informatikk</option>
                                        <option value={Degree.POST}>Postbachelor</option>
                                        <option value={Degree.MISC}>Annet studieløp</option>
                                    </Select>
                                </FormControl>
                                <FormControl as="fieldset" isRequired>
                                    <FormLabel as="legend">Hvilket trinn går du på?</FormLabel>
                                    <RadioGroup defaultValue="1">
                                        <VStack align="left">
                                            <Radio value="1" {...register('degreeYear')}>
                                                1. trinn
                                            </Radio>
                                            <Radio value="2" {...register('degreeYear')}>
                                                2. trinn
                                            </Radio>
                                            <Radio value="3" {...register('degreeYear')}>
                                                3. trinn
                                            </Radio>
                                            <Radio value="4" {...register('degreeYear')}>
                                                4. trinn
                                            </Radio>
                                            <Radio value="5" {...register('degreeYear')}>
                                                5. trinn
                                            </Radio>
                                        </VStack>
                                    </RadioGroup>
                                </FormControl>
                                <FormControl id="terms" isRequired>
                                    <FormLabel>Bedkom Terms of Service</FormLabel>
                                    <Checkbox {...register('terms')}>
                                        Jeg godkjenner retningslinjene til Bedkom.
                                    </Checkbox>
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" mr={3} colorScheme="teal">
                                Send inn
                            </Button>
                            <Button onClick={onClose}>Lukk</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
};

export default BedpresForm;
