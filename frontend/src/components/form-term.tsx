import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { RegFormValues } from '../lib/api';

interface Props {
    id: 'terms1' | 'terms2' | 'terms3';
    children: React.ReactNode;
}

const FormTerm = ({ id, children }: Props): JSX.Element => {
    const { register } = useFormContext<RegFormValues>();

    return (
        <FormControl id={id} isRequired>
            <FormLabel>Bekreft</FormLabel>
            <Checkbox {...register(id)}>{children}</Checkbox>
        </FormControl>
    );
};

export default FormTerm;
