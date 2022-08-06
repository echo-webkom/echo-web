import { SelectProps, Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { Degree } from '../lib/api';

interface Props extends SelectProps {
    isHeading?: boolean;
    defaultValue?: number | string | ReadonlyArray<string>;
}

const FormDegree = ({ isHeading = false, defaultValue, placeholder = 'Velg studieretning', ...props }: Props) => {
    const { register } = useFormContext();
    const headingText = 'Studieretining';

    return (
        <FormControl id="degree" isRequired>
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
                <option value={Degree.DTEK}>Datateknologi</option>
                <option value={Degree.DSIK}>Datasikkerhet</option>
                <option value={Degree.DVIT}>Data Science/Datavitenskap</option>
                <option value={Degree.BINF}>Bioinformatikk</option>
                <option value={Degree.IMO}>Informatikk-matematikk-økonomi</option>
                <option value={Degree.INF}>Master i informatikk</option>
                <option value={Degree.PROG}>Felles master i programvareutvikling</option>
                <option value={Degree.ARMNINF}>Årsstudium i informatikk</option>
                <option value={Degree.POST}>Postbachelor</option>
                <option value={Degree.MISC}>Annet studieløp</option>
            </Select>
        </FormControl>
    );
};

export default FormDegree;
