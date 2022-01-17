import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { FormValues } from '../lib/api';

interface Props {
    id: 'terms1' | 'terms2' | 'terms3';
    children: React.ReactNode;
    register: UseFormRegister<FormValues>;
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
