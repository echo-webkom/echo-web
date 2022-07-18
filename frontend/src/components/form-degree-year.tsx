import type { SelectProps } from '@chakra-ui/react';
import { Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

interface Props extends SelectProps {
    isHeading?: boolean;
    defaultValue?: number | string | ReadonlyArray<string>;
}

const FormDegreeYear = ({ isHeading = false, defaultValue, ...props }: Props) => {
    const { register } = useFormContext();
    const headingText = 'Årstrinn';

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
            <Select defaultValue={defaultValue} placeholder="Velg årstrinn" {...register('degreeYear')} {...props}>
                <option value={1}>1. trinn</option>
                <option value={2}>2. trinn</option>
                <option value={3}>3. trinn</option>
                <option value={4}>4. trinn</option>
                <option value={5}>5. trinn</option>
            </Select>
        </FormControl>
    );
};

export default FormDegreeYear;
