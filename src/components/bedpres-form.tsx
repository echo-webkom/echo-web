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
                <ModalContent>
                    <ModalHeader>Påmelding</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>Navn</FormLabel>
                            <Input ref={initialRef} placeholder="Navn" />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>Epost</FormLabel>
                            <Input placeholder="Epost" />
                        </FormControl>
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
