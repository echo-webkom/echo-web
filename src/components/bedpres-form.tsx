import React, { useRef } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    Input,
    RadioGroup,
    VStack,
    Radio,
    Select,
    Checkbox,
} from '@chakra-ui/react';

const BedpresForm = ({ buttonDescription }: { buttonDescription: string }): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const initialRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <Button w="100%" colorScheme="teal" onClick={onOpen}>
                {buttonDescription}
            </Button>
            <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent mx="2">
                    <ModalHeader>Påmelding</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing="4">
                            <FormControl mt={4} isRequired>
                                <FormLabel>Epost</FormLabel>
                                <Input ref={initialRef} placeholder="Epost" />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Navn</FormLabel>
                                <Input placeholder="Navn" />
                            </FormControl>
                            <FormControl id="study" isRequired>
                                <FormLabel>Studieretning</FormLabel>
                                <Select placeholder="Velg studieretning">
                                    <option>Datateknologi</option>
                                    <option>Data Science</option>
                                    <option>Datasikkerhet</option>
                                    <option>IMØ</option>
                                    <option>Bioinformatikk</option>
                                </Select>
                            </FormControl>
                            <FormControl as="fieldset" isRequired>
                                <FormLabel as="legend">Hvilket trinn går du på?</FormLabel>
                                <RadioGroup defaultValue="1">
                                    <VStack align="left">
                                        <Radio value="1">1. trinn</Radio>
                                        <Radio value="2">2. trinn</Radio>
                                        <Radio value="3">3. trinn</Radio>
                                        <Radio value="4">4. trinn</Radio>
                                        <Radio value="5">5. trinn</Radio>
                                    </VStack>
                                </RadioGroup>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Bedkom terms of service</FormLabel>
                                <Checkbox value="approve">Jeg godkjenner retningslinjene til bedkom.</Checkbox>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="teal" mr={3}>
                            Send inn
                        </Button>
                        <Button onClick={onClose}>Lukk</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default BedpresForm;
