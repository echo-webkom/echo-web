import { FormControl, FormLabel, Input, Radio, RadioGroup, VStack } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import type { Question } from '@api/happening';
import type { RegFormValues } from '@api/registration';

interface Props {
    q: Question;
    index: number;
}

const FormQuestion = ({ q, index }: Props) => {
    const { register } = useFormContext<RegFormValues>();

    return q.inputType === 'radio' ? (
        <FormControl as="fieldset" isRequired>
            <FormLabel>{q.questionText}</FormLabel>
            <RadioGroup defaultValue={q.alternatives?.[0] ?? ''}>
                <VStack align="left">
                    {q.alternatives?.map((alt: string) => {
                        return (
                            <Radio key={`radio-key-${alt}`} value={alt} {...register(`answers.${index}`)}>
                                {alt}
                            </Radio>
                        );
                    })}
                </VStack>
            </RadioGroup>
        </FormControl>
    ) : (
        <FormControl isRequired>
            <FormLabel>{q.questionText}</FormLabel>
            <Input {...register(`answers.${index}`)} />
        </FormControl>
    );
};

export default FormQuestion;
