import type { SelectProps } from '@chakra-ui/react';
import { Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import useLanguage from '@hooks/use-language';

interface Props extends SelectProps {
    isHeading?: boolean;
    hideLabel?: boolean;
    isRequired?: boolean;
}
const FormDegree = ({ isHeading = false, hideLabel = false, isRequired = false, ...props }: Props) => {
    const { register } = useFormContext();
    const isNorwegian = useLanguage();
    const headingText = isNorwegian ? 'Studieretning' : 'Field of study';

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
            <Select {...register('degree')} {...props} defaultValue="">
                <option hidden disabled value="">
                    {isNorwegian ? 'Velg studieretning' : 'Select field of study'}
                </option>
                <option value="DTEK">Datateknologi</option>
                <option value="DSIK">Datasikkerhet</option>
                <option value="DVIT">Data Science/Datavitenskap</option>
                <option value="BINF">Bioinformatikk</option>
                <option value="IMO">Informatikk-matematikk-økonomi</option>
                <option value="INF">Master i informatikk</option>
                <option value="PROG">Felles master i programvareutvikling</option>
                <option value="DSCI">Master i Data Science</option>
                <option value="ARMNINF">Årsstudium i informatikk</option>
                <option value="POST">Postbachelor</option>
            </Select>
        </FormControl>
    );
};

export default FormDegree;
