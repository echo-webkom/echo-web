import type { SelectProps } from '@chakra-ui/react';
import { Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

interface Props extends SelectProps {
    isHeading?: boolean;
    defaultValue?: number | string | ReadonlyArray<string>;
}

const FormDegree = ({ isHeading = false, defaultValue, placeholder = 'Velg studieretning', ...props }: Props) => {
    const { register } = useFormContext();
    const headingText = 'Studieretning';

    return (
        <FormControl isRequired>
            <FormLabel>
                {isHeading ? (
                    <Heading size="md" display="inline">
                        {headingText}
                    </Heading>
                ) : (
                    headingText
                )}
            </FormLabel>
            <Select defaultValue={defaultValue} placeholder={placeholder} {...register('degree')} {...props}>
                <option value="DTEK">Datateknologi</option>
                <option value="DSIK">Datasikkerhet</option>
                <option value="DVIT">Data Science/Datavitenskap</option>
                <option value="BINF">Bioinformatikk</option>
                <option value="IMO">Informatikk-matematikk-økonomi</option>
                <option value="INF">Master i informatikk</option>
                <option value="PROG">Felles master i programvareutvikling</option>
                <option value="ARMNINF">Årsstudium i informatikk</option>
                <option value="POST">Postbachelor</option>
            </Select>
        </FormControl>
    );
};

export default FormDegree;
