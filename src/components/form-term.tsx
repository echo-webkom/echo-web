import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';
import React from 'react';
import { UseFormRegister, FieldValues } from 'react-hook-form';

interface Props {
    id: string;
    children: React.ReactNode;
    register: UseFormRegister<FieldValues>;
}

const FormTerm = ({ id, children, register }: Props): JSX.Element => {
    return (
        <FormControl id={id} isRequired>
            <FormLabel>Bekreft</FormLabel>
            <Checkbox {...register(id)}>{children}</Checkbox>
        </FormControl>
    );
};

export default FormTerm;
