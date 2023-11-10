import { FormControl, InputGroup, Input, InputRightAddon, Icon, Tooltip, type InputProps } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { BsQuestion } from 'react-icons/bs';
import useLanguage from '@hooks/use-language';

interface Props extends InputProps {}

const FormAlternativeEmail = ({ ...props }: Props) => {
    const { register } = useFormContext();
    const isNorwegian = useLanguage();

    return (
        <FormControl>
            <InputGroup>
                <Input
                    type="email"
                    placeholder={isNorwegian ? 'Alternativ e-post' : 'Alternate email'}
                    {...register('alternateEmail')}
                    {...props}
                />
                <InputRightAddon>
                    <Tooltip
                        label={
                            isNorwegian
                                ? 'Denne vil bli brukt i stedet for studentmailen din når du melder deg på et arrangement'
                                : 'Your alternate email will be used instead of your student email when you sign up for an event.'
                        }
                    >
                        <span>
                            <Icon as={BsQuestion} p="0.1rem" w={8} h={8} />
                        </span>
                    </Tooltip>
                </InputRightAddon>
            </InputGroup>
        </FormControl>
    );
};

export default FormAlternativeEmail;
