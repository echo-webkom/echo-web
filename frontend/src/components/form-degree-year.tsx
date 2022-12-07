import type { SelectProps } from '@chakra-ui/react';
import { Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import useLanguage from '@hooks/use-language';

interface Props extends SelectProps {
    isHeading?: boolean;
    hideLabel?: boolean;
    isRequired?: boolean;
}

const FormDegreeYear = ({ isHeading = false, hideLabel = false, isRequired = false, ...props }: Props) => {
    const { register } = useFormContext();
    const isNorwegian = useLanguage();
    const headingText = isNorwegian ? 'Årstrinn' : 'Year';

    return (
        <FormControl isRequired={isRequired}>
            {!hideLabel && (
                <FormLabel>
                    {isHeading ? (
                        <Heading size="md" display="inline">
                            {headingText}
                        </Heading>
                    ) : (
                        headingText
                    )}
                </FormLabel>
            )}
            <Select {...register('degreeYear')} {...props} defaultValue="">
                <option hidden disabled value="">
                    {isNorwegian ? 'Velg årstrinn' : 'Select year'}
                </option>
                <option value={1}>{isNorwegian ? '1. trinn' : '1. year'}</option>
                <option value={2}>{isNorwegian ? '2. trinn' : '2. year'}</option>
                <option value={3}>{isNorwegian ? '3. trinn' : '3. year'}</option>
                <option value={4}>{isNorwegian ? '4. trinn' : '4. year'}</option>
                <option value={5}>{isNorwegian ? '5. trinn' : '5. year'}</option>
            </Select>
        </FormControl>
    );
};

export default FormDegreeYear;
