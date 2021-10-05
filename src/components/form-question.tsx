import { FormControl, FormLabel, Input, Radio, RadioGroup, VStack } from '@chakra-ui/react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Question } from '../lib/api/decoders';

interface Props {
    q: Question;
    index: number;
}

const FormQuestion = ({ q, index }: Props): JSX.Element => {
    const { register } = useFormContext();

    if (q.inputType === 'radio') {
        return (
            <FormControl as="fieldset" isRequired>
                <FormLabel>{q.questionText}</FormLabel>
                <RadioGroup defaultValue={q?.alternatives?.[0] || ''}>
                    <VStack align="left">
                        {q.alternatives &&
                            q.alternatives.map((alt: string) => {
                                return (
                                    <Radio key={`radio-key-${alt}`} value={alt} {...register(`answers.${index}`)}>
                                        {alt}
                                    </Radio>
                                );
                            })}
                    </VStack>
                </RadioGroup>
            </FormControl>
        );
    }
    if (q.inputType === 'textbox') {
        return (
            <FormControl isRequired>
                <FormLabel>{q.questionText}</FormLabel>
                <Input {...register(`answers.${index}`)} />
            </FormControl>
        );
    }

    return <></>;
};

export default FormQuestion;
