import { useContext } from 'react';
import type { SelectProps } from '@chakra-ui/react';
import { Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import LanguageContext from 'language-context';

interface Props extends SelectProps {
    isHeading?: boolean;
    defaultValue?: number | string | ReadonlyArray<string>;
}

const FormDegreeYear = ({ isHeading = false, defaultValue, ...props }: Props) => {
    const { register } = useFormContext();
    const isNorwegian = useContext(LanguageContext);
    const headingText = isNorwegian ? 'Årstrinn' : 'Year';

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
            <Select
                defaultValue={defaultValue}
                placeholder={isNorwegian ? 'Velg årstrinn' : 'Choose year'}
                {...register('degreeYear')}
                {...props}
            >
                {isNorwegian ? '. trinn' : '. year'}
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
